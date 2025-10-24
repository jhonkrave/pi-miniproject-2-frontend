import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type WatchResponse } from '@/lib/api';
import Spinner from '@/components/Spinner';
import { PlayIcon, PauseIcon } from '@/components/Icons';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<WatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api.watch(String(id))
      .then(res => { if (alive) setData(res); })
      .catch((e: any) => { if (alive) setError(e?.status === 404 ? 'Película no encontrada' : (e?.message || 'No se pudo cargar el video')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  function onPlay() { videoRef.current?.play(); }
  function onPause() { videoRef.current?.pause(); }

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

  const sourceUrl = (() => {
    const files = (data as any)?.video?.video_files as Array<{ link: string; width: number; quality: string }> | undefined;
    if (!files || files.length === 0) return '';
    const sorted = [...files].sort((a, b) => (b.width || 0) - (a.width || 0));
    return sorted[0]?.link || '';
  })();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onp = () => setIsPlaying(true);
    const onpa = () => setIsPlaying(false);
    const onend = () => setIsPlaying(false);
    v.addEventListener('play', onp);
    v.addEventListener('pause', onpa);
    v.addEventListener('ended', onend);
    return () => {
      v.removeEventListener('play', onp);
      v.removeEventListener('pause', onpa);
      v.removeEventListener('ended', onend);
    };
  }, [data?.movie?.id]);

  return (
    <section className="watch-page">
      {loading && (
        <div className="container" style={{padding:'100px 24px', textAlign:'center'}}>
          <Spinner size={32} /> <div style={{marginTop:16}}>Preparando el reproductor...</div>
        </div>
      )}
      {error && !loading && (
        <div className="container" style={{padding:'100px 24px'}}>
          <div className="card" role="alert" style={{padding:24, textAlign:'center'}}>{error}</div>
        </div>
      )}

      {!loading && !error && data && (
        <div ref={containerRef} className="video-player">
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

          <div className="video-controls">
            <div className="controls-top">
              <button className="back-button" onClick={() => window.history.back()} aria-label="Volver">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div className="video-title">{data.movie.title}</div>
              <button className="cast-button" aria-label="Transmitir">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                  <line x1="2" y1="20" x2="2.01" y2="20"></line>
                </svg>
              </button>
            </div>

            <div className="controls-bottom">
              <div className="progress-bar">
                <div className="progress-filled" style={{width: '0%'}} />
              </div>
              
              <div className="controls-actions">
                <div className="controls-left">
                  <button onClick={() => isPlaying ? onPause() : onPlay()} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                    {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                  </button>
                  <span className="time-display">0:00 / {data.movie.year || '0:00'}</span>
                </div>
                
                <div className="controls-right">
                  <button aria-label="Subtítulos">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="6" y1="15" x2="6.01" y2="15"></line>
                      <line x1="10" y1="15" x2="14" y2="15"></line>
                      <line x1="18" y1="15" x2="18.01" y2="15"></line>
                    </svg>
                  </button>
                  <button aria-label="Configuración">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m0 4.828l-4.243 4.243m13.657-5.657l-6-0 m-6 0l-6 0m13.657 5.657l-4.243-4.243m0-4.828l-4.243-4.243"></path>
                    </svg>
                  </button>
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
    </section>
  );
}


