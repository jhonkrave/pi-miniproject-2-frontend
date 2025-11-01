import { useState, useEffect, useRef } from 'react';
import { api, type Subtitle } from '@/lib/api';
import { generateVTTFromText, createVTTBlobURL } from '@/lib/subtitleHelper';
import { ChevronDownIcon } from './Icons';

/**
 * SubtitleControls component for LumiFlix - mini project 2
 * 
 * Provides controls to activate/deactivate subtitles and change language (es/en).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.movieId - Movie ID
 * @param {React.RefObject<HTMLVideoElement>} props.videoRef - Reference to the video element
 * @param {Function} props.onSubtitleChange - Callback when subtitle state changes
 * @returns {JSX.Element} The SubtitleControls component
 * 
 * @since 3.0.0
 */
type SubtitleControlsProps = {
  movieId: string | number;
  videoRef: React.RefObject<HTMLVideoElement>;
  movieOverview?: string; // Plot/overview from TMDB in Spanish for auto-generating subtitles
  movieOverviewEn?: string; // Plot/overview from TMDB in English for auto-generating subtitles
  videoDuration?: number; // Video duration in seconds for calculating subtitle timing
  onSubtitleChange?: (active: boolean, language: 'es' | 'en' | null) => void;
};

type SubtitleState = {
  enabled: boolean;
  language: 'es' | 'en' | null;
};

export default function SubtitleControls({ movieId, videoRef, movieOverview, movieOverviewEn, videoDuration = 60, onSubtitleChange }: SubtitleControlsProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<SubtitleState>({ enabled: false, language: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const blobURLsRef = useRef<string[]>([]); // Store blob URLs to revoke them later

  /**
   * Load subtitles from API and restore user preferences
   */
  useEffect(() => {
    let alive = true;
    setLoading(true);

    // Try to load subtitles from backend first
    api.getMovieSubtitles(movieId)
      .then(data => {
        if (!alive) return;
        
        // If backend has subtitles, use those
        if (data && data.length > 0) {
          setSubtitles(data);
          
          // Restore user preferences from localStorage
          const savedPrefs = localStorage.getItem(`subtitle_prefs_${movieId}`);
          if (savedPrefs) {
            try {
              const prefs = JSON.parse(savedPrefs);
              if (prefs.enabled && prefs.language) {
                const available = data.find(s => s.language === prefs.language);
                if (available) {
                  setState({ enabled: true, language: prefs.language as 'es' | 'en' });
                  setTimeout(() => {
                    if (alive) loadSubtitleTrack(available);
                  }, 100);
                }
              }
            } catch {
              // Invalid saved prefs, ignore
            }
          }
        } else if ((movieOverview && movieOverview.trim().length > 0) || (movieOverviewEn && movieOverviewEn.trim().length > 0)) {
          // If no backend subtitles but we have overview, generate them dynamically
          const autoSubtitles = generateAutoSubtitles(movieOverview, movieOverviewEn, videoDuration);
          setSubtitles(autoSubtitles);
          
          // Restore user preferences from localStorage for auto-generated subtitles
          const savedPrefs = localStorage.getItem(`subtitle_prefs_${movieId}`);
          if (savedPrefs) {
            try {
              const prefs = JSON.parse(savedPrefs);
              if (prefs.enabled && prefs.language) {
                const available = autoSubtitles.find(s => s.language === prefs.language);
                if (available) {
                  setState({ enabled: true, language: prefs.language as 'es' | 'en' });
                  setTimeout(() => {
                    if (alive) loadSubtitleTrack(available);
                  }, 100);
                }
              }
            } catch {
              // Invalid saved prefs, ignore
            }
          }
        } else {
          // No subtitles available at all
          setSubtitles([]);
        }
      })
      .catch(() => {
        // Backend error - try to use auto-generated if we have overview
        if ((movieOverview && movieOverview.trim().length > 0) || (movieOverviewEn && movieOverviewEn.trim().length > 0)) {
          const autoSubtitles = generateAutoSubtitles(movieOverview, movieOverviewEn, videoDuration);
          setSubtitles(autoSubtitles);
          
          // Restore user preferences from localStorage for auto-generated subtitles
          const savedPrefs = localStorage.getItem(`subtitle_prefs_${movieId}`);
          if (savedPrefs) {
            try {
              const prefs = JSON.parse(savedPrefs);
              if (prefs.enabled && prefs.language) {
                const available = autoSubtitles.find(s => s.language === prefs.language);
                if (available) {
                  setState({ enabled: true, language: prefs.language as 'es' | 'en' });
                  setTimeout(() => {
                    if (alive) loadSubtitleTrack(available);
                  }, 100);
                }
              }
            } catch {
              // Invalid saved prefs, ignore
            }
          }
        } else {
          if (alive) setSubtitles([]);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // Note: movieOverview, movieOverviewEn and videoDuration are intentionally included to regenerate subtitles
    // when they change, but we disable exhaustive deps to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, movieOverview, movieOverviewEn, videoDuration]);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  /**
   * Generate auto-subtitles from movie overview in both languages
   */
  function generateAutoSubtitles(overviewEs?: string, overviewEn?: string, duration: number = 60): Subtitle[] {
    const autoSubtitles: Subtitle[] = [];
    
    // Generate Spanish subtitles from overview
    if (overviewEs && overviewEs.trim().length > 0) {
      const vttContent = generateVTTFromText(overviewEs, duration);
      const blobURL = createVTTBlobURL(vttContent);
      blobURLsRef.current.push(blobURL);
      
      autoSubtitles.push({
        _id: `auto-es-${movieId}`,
        movieId,
        language: 'es',
        url: blobURL,
        label: 'Spanish',
        isDefault: true,
      });
    }
    
    // Generate English subtitles from English overview (or fallback to Spanish if not available)
    const englishText = (overviewEn && overviewEn.trim().length > 0) ? overviewEn : (overviewEs || '');
    if (englishText.trim().length > 0) {
      const englishVttContent = generateVTTFromText(englishText, duration);
      const englishBlobURL = createVTTBlobURL(englishVttContent);
      blobURLsRef.current.push(englishBlobURL);
      
      autoSubtitles.push({
        _id: `auto-en-${movieId}`,
        movieId,
        language: 'en',
        url: englishBlobURL,
        label: 'English',
        isDefault: !overviewEs || (overviewEn && overviewEn.trim().length > 0) ? false : false, // Spanish is default if both available
      });
    }
    
    return autoSubtitles;
  }

  /**
   * Cleanup blob URLs on unmount
   */
  useEffect(() => {
    return () => {
      // Revoke all blob URLs to free memory
      blobURLsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobURLsRef.current = [];
    };
  }, []);

  /**
   * Save preferences to localStorage
   */
  function savePreferences(enabled: boolean, language: 'es' | 'en' | null) {
    localStorage.setItem(`subtitle_prefs_${movieId}`, JSON.stringify({
      enabled,
      language,
    }));
  }

  /**
   * Load subtitle track into video element
   * Uses useCallback-like pattern to avoid recreating on every render
   */
  const loadSubtitleTrack = (subtitle: Subtitle) => {
    const video = videoRef.current;
    if (!video) return;

    // Remove existing subtitle tracks
    const existingTracks = video.querySelectorAll('track[kind="subtitles"]');
    existingTracks.forEach(track => track.remove());

    // Create and add new track
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = subtitle.label;
    track.srclang = subtitle.language;
    track.src = subtitle.url;
    track.default = subtitle.isDefault;

    // Handle track loading errors
    track.addEventListener('error', () => {
      alert('Subtítulos no disponibles');
    });

    video.appendChild(track);

    // Wait for track to load, then enable it
    track.addEventListener('load', () => {
      const textTracks = video.textTracks;
      if (textTracks && textTracks.length > 0) {
        // Find the track we just added
        for (let i = 0; i < textTracks.length; i++) {
          if (textTracks[i].language === subtitle.language) {
            textTracks[i].mode = 'showing';
            break;
          }
        }
      }
    });
  };

  /**
   * Toggle subtitles on/off
   */
  function toggleSubtitles() {
    if (!state.enabled) {
      // If no language selected, use default or first available
      const defaultSubtitle = subtitles.find(s => s.isDefault) || subtitles[0];
      if (defaultSubtitle) {
        const newState = { enabled: true, language: defaultSubtitle.language as 'es' | 'en' };
        setState(newState);
        loadSubtitleTrack(defaultSubtitle);
        savePreferences(true, newState.language);
        onSubtitleChange?.(true, newState.language);
      }
    } else {
      // Toggle off
      const video = videoRef.current;
      if (video) {
        const textTracks = video.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
          textTracks[i].mode = 'hidden';
        }
      }
      const newState = { enabled: false, language: state.language };
      setState(newState);
      savePreferences(false, newState.language);
      onSubtitleChange?.(false, newState.language);
    }
  }

  /**
   * Change subtitle language
   */
  function changeLanguage(language: 'es' | 'en') {
    const subtitle = subtitles.find(s => s.language === language);
    if (!subtitle) {
      alert('Subtítulos no disponibles para este idioma');
      return;
    }

    const newState = { enabled: true, language };
    setState(newState);
    loadSubtitleTrack(subtitle);
    savePreferences(true, language);
    setMenuOpen(false);
    onSubtitleChange?.(true, language);
  }

  // If no subtitles available, show disabled button
  if (!loading && subtitles.length === 0) {
    return (
      <button
        className="subtitle-btn disabled"
        aria-label="Subtítulos no disponibles"
        title="Subtítulos no disponibles"
        disabled
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="6" y1="15" x2="6.01" y2="15"></line>
          <line x1="10" y1="15" x2="14" y2="15"></line>
          <line x1="18" y1="15" x2="18.01" y2="15"></line>
        </svg>
      </button>
    );
  }

  const hasSubtitles = subtitles.length > 0;
  const spanishAvailable = subtitles.some(s => s.language === 'es');
  const englishAvailable = subtitles.some(s => s.language === 'en');

  return (
    <div className="subtitle-controls" ref={menuRef}>
      <button
        className={`subtitle-btn ${state.enabled ? 'active' : ''}`}
        onClick={hasSubtitles ? toggleSubtitles : undefined}
        aria-label={state.enabled ? 'Desactivar subtítulos' : 'Activar subtítulos'}
        disabled={!hasSubtitles}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="6" y1="15" x2="6.01" y2="15"></line>
          <line x1="10" y1="15" x2="14" y2="15"></line>
          <line x1="18" y1="15" x2="18.01" y2="15"></line>
        </svg>
        {state.enabled && state.language && (
          <span className="subtitle-indicator">{state.language.toUpperCase()}</span>
        )}
      </button>

      {hasSubtitles && (
        <>
          <button
            className="subtitle-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Configuración de subtítulos"
            aria-expanded={menuOpen}
          >
            <ChevronDownIcon size={16} className={menuOpen ? 'rotated' : ''} />
          </button>

          {menuOpen && (
            <div className="subtitle-menu">
              <div className="subtitle-menu-header">SUBTÍTULOS</div>
              <div className="subtitle-menu-options">
                <button
                  className={`subtitle-menu-item ${!state.enabled ? 'active' : ''}`}
                  onClick={() => {
                    toggleSubtitles();
                    setMenuOpen(false);
                  }}
                >
                  <span>Desactivar</span>
                </button>
                {spanishAvailable && (
                  <button
                    className={`subtitle-menu-item ${state.enabled && state.language === 'es' ? 'active' : ''}`}
                    onClick={() => changeLanguage('es')}
                  >
                    <span>Español</span>
                  </button>
                )}
                {englishAvailable && (
                  <button
                    className={`subtitle-menu-item ${state.enabled && state.language === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    <span>English</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

