import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type WatchResponse, type Rating, type RatingStats } from '@/lib/api';
import VideoLoader from '@/components/VideoLoader';
import Spinner from '@/components/Spinner';
import { PlayIcon, PauseIcon, StarIcon } from '@/components/Icons';
import StarRating from '@/components/StarRating';
import CommentList from '@/components/CommentList';
import SubtitleControls from '@/components/SubtitleControls';
import { useAuth } from '@/context/AuthContext';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<WatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [overviewEn, setOverviewEn] = useState<string | null>(null); // English overview for subtitles
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  
  // Rating state
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scroll to top when page loads or movie ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Load movie data in Spanish (default)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setOverviewEn(null);
    
    // Load Spanish version (default)
    api.watch(String(id), 'es-ES')
      .then(res => { 
        if (alive) {
          setData(res);
          
          // Also load English version to get English overview for subtitles
          if (id) {
            api.getMovie(id, 'en-US')
              .then(englishData => {
                if (alive && englishData?.movie?.overview) {
                  setOverviewEn(englishData.movie.overview);
                }
              })
              .catch(() => {
                // If English fails, that's okay - we'll use Spanish for both
              });
          }
        }
      })
      .catch((e: any) => { if (alive) setError(e?.status === 404 ? 'Película no encontrada' : (e?.message || 'No se pudo cargar el video')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  // Load rating data when movie loads
  useEffect(() => {
    if (!id || !data) return;
    let alive = true;

    // Load rating stats (public)
    api.getMovieRatingStats(id)
      .then(stats => { if (alive) setRatingStats(stats); })
      .catch(() => { if (alive) setRatingStats({ average: 0, count: 0 }); });

    // Load user rating if logged in
    if (user) {
      api.getUserRating(id)
        .then(rating => { if (alive) setUserRating(rating); })
        .catch((e) => { 
          // 404 is handled in getUserRating, but catch any other errors
          if (alive) setUserRating(null); 
        });
    }

    return () => { alive = false; };
  }, [id, data, user]);

  // Reset controls timeout function
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Show controls when user interacts
    setShowControls(true);
    
    // Auto-hide controls after 3 seconds if playing (or 5 seconds in fullscreen)
    if (isPlaying) {
      const timeout = isFullscreen ? 5000 : 3000;
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, timeout);
    }
  }, [isPlaying, isFullscreen]);

  function onPlay() { 
    videoRef.current?.play();
    resetControlsTimeout();
  }
  function onPause() { 
    videoRef.current?.pause();
    setShowControls(true);
  }

  /**
   * Format time in seconds to MM:SS or HH:MM:SS format
   */
  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Handle progress bar click to seek video
   */
  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    if (!video || !progressBar || !isFinite(video.duration)) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * video.duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  }

  /**
   * Handle progress bar mouse move for hover indicator
   */
  function handleProgressHover(e: React.MouseEvent<HTMLDivElement>) {
    const progressBar = e.currentTarget;
    if (!progressBar || !isFinite(videoDuration) || videoDuration <= 0) return;

    const rect = progressBar.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
    setHoverProgress(percentage * 100);
  }

  function handleProgressLeave() {
    setHoverProgress(null);
  }

  /**
   * Calculate progress percentage
   */
  const progressPercentage = videoDuration > 0 
    ? (currentTime / videoDuration) * 100 
    : 0;

  /**
   * Handle rating change when user clicks on stars
   * 
   * @param {number} newRating - New rating value (1-5)
   */
  async function handleRatingChange(newRating: number) {
    if (!user || !id) {
      alert('Debes iniciar sesión para calificar películas.');
      return;
    }

    setRatingLoading(true);
    setRatingError(null);

    try {
      if (userRating?._id) {
        // Update existing rating
        const updated = await api.updateRating(userRating._id, newRating);
        setUserRating(updated);
      } else {
        // Create new rating
        const created = await api.createRating({ movieId: id, rating: newRating });
        setUserRating(created);
      }

      // Refresh rating stats
      const stats = await api.getMovieRatingStats(id);
      setRatingStats(stats);
    } catch (e: any) {
      setRatingError(e?.message || 'No se pudo guardar la calificación');
    } finally {
      setRatingLoading(false);
    }
  }

  function toggleFullscreen() {
    const el = containerRef.current as any;
    if (!el) return;
    const d: any = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (d.exitFullscreen) d.exitFullscreen();
      else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
    }
  }

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const d: any = document;
      const container = containerRef.current;
      
      // Check if our container is in fullscreen
      const isCurrentlyFullscreen = !!(
        (d.fullscreenElement === container) || 
        (d.webkitFullscreenElement === container) || 
        (d.mozFullScreenElement === container) || 
        (d.msFullscreenElement === container)
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Auto-hide controls when entering fullscreen
      if (isCurrentlyFullscreen) {
        // Force hide controls immediately
        setShowControls(false);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
      } else {
        // Restore controls when exiting fullscreen (show if paused, hide if playing)
        if (!isPlaying) {
          setShowControls(true);
        } else {
          // If playing, show briefly then hide
          setShowControls(true);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isPlaying]);

  const sourceUrl = (() => {
    const files = (data as any)?.video?.video_files as Array<{ link: string; width: number; quality: string }> | undefined;
    if (!files || files.length === 0) return '';
    const sorted = [...files].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted[0]?.link || '';
  })();

  // Handle user interaction - show controls and reset timeout
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseMoveTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastMouseMoveTime = 0;

    const handleUserInteraction = () => {
      // Always show controls on user interaction
      setShowControls(true);
      resetControlsTimeout();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mousemove events to avoid performance issues
      const now = Date.now();
      if (now - lastMouseMoveTime < 100) return;
      lastMouseMoveTime = now;

      // Show controls when mouse moves
      handleUserInteraction();
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      // Show controls on any key press (except when typing in input fields)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      handleUserInteraction();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchstart', handleUserInteraction);
    container.addEventListener('mousedown', handleUserInteraction);
    container.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleUserInteraction);
      container.removeEventListener('mousedown', handleUserInteraction);
      container.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleKeyPress);
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }
    };
  }, [resetControlsTimeout]);

  // Auto-hide controls when playing starts
  useEffect(() => {
    // When in fullscreen, don't automatically show controls when paused
    // (they should only show on user interaction)
    if (isFullscreen) {
      if (isPlaying) {
        // In fullscreen, hide controls after timeout if playing
        resetControlsTimeout();
      }
      // When paused in fullscreen, keep current state (don't force show)
      return;
    }
    
    // Normal mode (not fullscreen)
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      // Always show controls when paused (normal mode)
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying, isFullscreen, resetControlsTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    
    const onp = () => {
      setIsPlaying(true);
      resetControlsTimeout();
    };
    const onpa = () => {
      setIsPlaying(false);
      setShowControls(true); // Always show when paused
    };
    const onend = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    
    // Get video duration when metadata loads
    const onLoadedMetadata = () => {
      if (v.duration && isFinite(v.duration)) {
        setVideoDuration(v.duration);
      }
    };

    // Update current time
    const onTimeUpdate = () => {
      if (v.currentTime && isFinite(v.currentTime)) {
        setCurrentTime(v.currentTime);
      }
    };
    
    v.addEventListener('play', onp);
    v.addEventListener('pause', onpa);
    v.addEventListener('ended', onend);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('timeupdate', onTimeUpdate);
    
    // Try to get duration if already loaded
    if (v.duration && isFinite(v.duration)) {
      setVideoDuration(v.duration);
    }
    
    return () => {
      v.removeEventListener('play', onp);
      v.removeEventListener('pause', onpa);
      v.removeEventListener('ended', onend);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [data?.movie?.id]);

  return (
    <section className="watch-page">
      {loading && (
        <div className="watch-loading-container">
          <VideoLoader />
        </div>
      )}
      {error && !loading && (
        <div className="container" style={{padding:'100px 24px'}}>
          <div className="card" role="alert" style={{padding:24, textAlign:'center'}}>{error}</div>
        </div>
      )}

      {!loading && !error && data && (
        <div ref={containerRef} className={`video-player ${isFullscreen ? 'is-fullscreen' : ''}`}>
          <video 
            ref={videoRef} 
            src={sourceUrl} 
            preload="metadata" 
            poster={data.movie.backdrop || data.movie.poster}
            onClick={() => isPlaying ? onPause() : onPlay()}
          />
          
          {!isPlaying && (
            <div className="play-overlay" onClick={() => { onPlay(); }}>
              <button className="play-button" aria-label="Reproducir">
                <PlayIcon size={48} />
              </button>
            </div>
          )}

          <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
            <div className="controls-top">
              <button className="back-button" onClick={() => window.history.back()} aria-label="Volver">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div className="video-title">{data.movie.title}</div>
            </div>

            <div className="controls-bottom">
              <div 
                className="progress-bar" 
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseLeave={handleProgressLeave}
                role="slider"
                aria-label="Barra de progreso del video"
                aria-valuemin={0}
                aria-valuemax={videoDuration}
                aria-valuenow={currentTime}
                tabIndex={0}
              >
                <div className="progress-filled" style={{width: `${progressPercentage}%`}} />
                {hoverProgress !== null && (
                  <div 
                    className="progress-hover-indicator" 
                    style={{left: `${hoverProgress}%`}}
                  />
                )}
              </div>
              
              <div className="controls-actions">
                <div className="controls-left">
                  <button onClick={() => isPlaying ? onPause() : onPlay()} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                    {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                  </button>
                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>
                
                <div className="controls-right">
                  <SubtitleControls 
                    movieId={id!} 
                    videoRef={videoRef}
                    movieOverview={data.movie.overview}
                    movieOverviewEn={overviewEn || undefined}
                    videoDuration={videoDuration}
                  />
                  <button onClick={toggleFullscreen} aria-label="Pantalla completa">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie information and rating section */}
      {!loading && !error && data && (
        <div className="watch-movie-info">
          <div className="container">
            <div className="movie-info-header">
              <h1 className="movie-info-title">{data.movie.title}</h1>
              {data.movie.year && (
                <span className="movie-info-year">{data.movie.year}</span>
              )}
            </div>

            {data.movie.overview && (
              <p className="movie-info-overview">{data.movie.overview}</p>
            )}

            {/* Rating section */}
            <div className="movie-rating-section">
              <div className="rating-average">
                <h3>Calificación promedio</h3>
                {ratingStats && ratingStats.count > 0 ? (
                  <div className="rating-display">
                    <div className="rating-stars-display">
                      <StarRating 
                        rating={ratingStats.average} 
                        readOnly 
                        size={28}
                      />
                    </div>
                    <div className="rating-text">
                      <span className="rating-average-value">
                        {ratingStats.average.toFixed(1)}
                      </span>
                      <span className="rating-count">
                        ({ratingStats.count} {ratingStats.count === 1 ? 'calificación' : 'calificaciones'})
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="no-ratings">Aún no hay calificaciones</p>
                )}
              </div>

              {user && (
                <div className="rating-user">
                  <h3>Tu calificación</h3>
                  <div className="rating-interactive">
                    <StarRating
                      rating={userRating?.rating || 0}
                      onRatingChange={handleRatingChange}
                      readOnly={ratingLoading}
                      size={32}
                    />
                    {ratingError && (
                      <div className="rating-error" role="alert">
                        {ratingError}
                      </div>
                    )}
                    {ratingLoading && (
                      <div className="rating-loading">
                        <Spinner size={16} /> Guardando...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments section */}
      {!loading && !error && data && (
        <div className="watch-comments-section">
          <div className="container">
            <CommentList movieId={data.movie.id} />
          </div>
        </div>
      )}
    </section>
  );
}


