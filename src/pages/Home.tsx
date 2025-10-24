import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, type MovieItem, type PagedMovies } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { PlayIcon, HeartIcon, StarIcon, FilmIcon, SmartphoneIcon } from '@/components/Icons';

/**
 * Home component for LumiFlix - mini project 2
 * 
 * This component renders the main welcoming page of the LumiFlix streaming platform.
 * It consists of three main sections that provide an engaging user experience:
 * 
 * 1. **Hero Section**: Features the main title, tagline, and call-to-action buttons
 *    for user registration and information about the platform.
 * 
 * 2. **Showcase Section**: Displays a grid of placeholder content cards with
 *    gradient backgrounds and skeleton loading elements to simulate a content library.
 * 
 * 3. **Call-to-Action Section**: Contains a prominent banner encouraging users
 *    to create an account or log in to access platform features.
 * 
 * The component uses inline styles for responsive design and creates an attractive
 * landing page that introduces new users to the LumiFlix platform.
 * 
 * @component
 * @returns {JSX.Element} The Home page component with hero, showcase, and CTA sections
 * 
 * @example
 * ```tsx
 * import Home from './pages/Home';
 * 
 * function App() {
 *   return <Home />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function Home() {
  const [popular, setPopular] = useState<MovieItem[]>([]);
  const { favorites } = useFavorites();
  const [genres, setGenres] = useState<any[]>([]);
  const [genreMovies, setGenreMovies] = useState<Record<string, MovieItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    Promise.all([
      api.getMovies({}),
      api.getGenres(),
    ])
      .then(async ([moviesRes, genresRes]) => {
        if (alive) {
          setPopular(moviesRes.results || []);
          const allGenres = genresRes.genres || [];
          setGenres(allGenres);

          // Cargar películas para los primeros 4 géneros
          const topGenres = allGenres.slice(0, 4);
          const genreMoviesData: Record<string, MovieItem[]> = {};
          
          await Promise.all(
            topGenres.map(async (genre: any) => {
              try {
                const res = await api.getMovies({ genreId: String(genre.id), page: 1 });
                genreMoviesData[genre.id] = (res.results || []).slice(0, 12);
              } catch {
                genreMoviesData[genre.id] = [];
              }
            })
          );
          
          if (alive) setGenreMovies(genreMoviesData);
        }
      })
      .catch((e: any) => { if (alive) setError(e?.message || 'No se pudo cargar el contenido'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);

  // Auto carousel for hero section
  useEffect(() => {
    if (popular.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % Math.min(5, popular.length));
    }, 7000); // Change every 7 seconds
    return () => clearInterval(interval);
  }, [popular.length]);

  const featuredMovies = popular.slice(0, 5);
  const currentHero = featuredMovies[currentHeroIndex];

  // Truncate overview for mobile
  const getTruncatedOverview = (overview: string, maxLength: number = 120) => {
    if (overview.length <= maxLength) return overview;
    return overview.substring(0, maxLength) + '...';
  };

  const shouldShowReadMore = (overview: string) => {
    return overview && overview.length > 120;
  };

  async function toggleFavorite() {
    if (!user) {
      alert('Debes iniciar sesión para gestionar favoritos.');
      return;
    }
    setLoadingFavorite(true);
    try {
      await toggle(currentHero);
    } catch (e: any) {
      alert(e?.message || 'No se pudo actualizar favoritos');
    } finally {
      setLoadingFavorite(false);
    }
  }

  // Si no está logueado, mostrar página de bienvenida
  if (!user) {
    return (
      <>
        {/* Hero de bienvenida para usuarios no logueados */}
        <section className="hero-welcome">
          <div className="hero-welcome-backdrop" />
          <div className="hero-welcome-gradient" />
          <div className="hero-welcome-content">
            <h1 className="hero-welcome-title">Descubre LumiFlix</h1>
            <p className="hero-welcome-subtitle">
              La mejor experiencia de streaming con miles de películas y series. 
              Únete a nuestra comunidad y disfruta del entretenimiento sin límites.
            </p>
            <div className="hero-welcome-actions">
              <Link to="/signup">
                <button className="btn-primary hero-welcome-signup">
                  Crear cuenta gratis
                </button>
              </Link>
              <Link to="/login">
                <button className="hero-welcome-login">
                  Iniciar sesión
                </button>
              </Link>
            </div>
            <div className="hero-welcome-features">
              <div className="hero-welcome-feature">
                <div className="hero-welcome-feature-icon">
                  <FilmIcon size={32} />
                </div>
                <span>Miles de películas</span>
              </div>
              <div className="hero-welcome-feature">
                <div className="hero-welcome-feature-icon">
                  <StarIcon size={32} filled />
                </div>
                <span>Contenido premium</span>
              </div>
              <div className="hero-welcome-feature">
                <div className="hero-welcome-feature-icon">
                  <SmartphoneIcon size={32} />
                </div>
                <span>En cualquier dispositivo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Muestra de contenido limitada para usuarios no logueados */}
        {!loading && !error && popular.length > 0 && (
          <section className="content-row">
            <div className="container">
              <div className="row-header">
                <h2>Películas populares</h2>
                <div className="content-cta">
                  <p>
                    <Link to="/signup">Regístrate gratis</Link> para ver todo el catálogo
                  </p>
                </div>
              </div>
              <div className="carousel">
                {popular.slice(0, 8).map(m => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="container" style={{padding:'100px 24px', textAlign:'center'}}>
            <Spinner /> <span style={{marginLeft:12}}>Cargando contenido...</span>
          </div>
        )}
        {error && !loading && (
          <div className="container" style={{padding:'100px 24px'}}>
            <div className="card" role="alert" style={{padding:24, textAlign:'center'}}>{error}</div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Hero carousel destacado - Solo para usuarios logueados */}
      {!loading && !error && currentHero && (
        <section className="hero-featured hero-carousel">
          <div 
            className="hero-backdrop" 
            style={{backgroundImage: `url(${currentHero.backdrop || currentHero.poster})`}} 
            key={currentHero.id}
          />
          <div className="hero-gradient" />
          <div className="container hero-content">
            <div className="hero-badge">
              {currentHero.voteAverage && (
                <span className="hero-rating">
                  <StarIcon size={16} filled />
                  {currentHero.voteAverage.toFixed(1)}
                </span>
              )}
              {currentHero.year && <span className="hero-year">{currentHero.year}</span>}
            </div>
            <h1>{currentHero.title}</h1>
            <div className="hero-overview-container">
              <p className="hero-overview">
                {showFullOverview 
                  ? (currentHero.overview || 'Una experiencia cinematográfica inolvidable te espera.')
                  : getTruncatedOverview(currentHero.overview || 'Una experiencia cinematográfica inolvidable te espera.')
                }
              </p>
              {shouldShowReadMore(currentHero.overview || '') && (
                <button 
                  className="hero-read-more"
                  onClick={() => setShowFullOverview(!showFullOverview)}
                >
                  {showFullOverview ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
            <div className="hero-actions">
              <Link to={`/watch/${currentHero.id}`}>
                <button className="btn-primary hero-play-btn">
                  <PlayIcon size={16} />
                  <span>Reproducir</span>
                </button>
              </Link>
              <button 
                className="btn-secondary hero-favorite-btn"
                onClick={toggleFavorite}
                disabled={loadingFavorite}
                aria-label={isFavorite(currentHero.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {loadingFavorite ? (
                  <Spinner size={16} color="white" />
                ) : (
                  <HeartIcon size={16} filled={isFavorite(currentHero.id)} />
                )}
              </button>
            </div>
            
            {/* Carousel indicators */}
            <div className="hero-indicators">
              {featuredMovies.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator ${idx === currentHeroIndex ? 'active' : ''}`}
                  onClick={() => setCurrentHeroIndex(idx)}
                  aria-label={`Ir a película destacada ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mis favoritos (solo si está logueado y tiene favoritos) */}
      {!loading && !error && user && favorites.length > 0 && (
        <section className="content-row">
          <div className="container">
            <div className="row-header">
              <h2>Mis favoritos</h2>
              <Link to="/favorites" className="see-all">Ver todo →</Link>
            </div>
            <div className="carousel">
              {favorites.slice(0, 12).map(m => (
                <MovieCard key={m.id} movie={m} isFavorite />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Películas populares */}
      {!loading && !error && popular.length > 0 && (
        <section className="content-row">
          <div className="container">
            <div className="row-header">
              <h2>Películas - Popular</h2>
              <Link to="/movies" className="see-all">Ver todo →</Link>
            </div>
            <div className="carousel">
              {popular.slice(1, 13).map(m => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explorar por género */}
      {!loading && !error && genres.length > 0 && (
        <section className="content-row">
          <div className="container">
            <div className="row-header">
              <h2>Explorar por género</h2>
            </div>
            <div className="genre-grid">
              {genres.slice(0, 12).map((genre) => (
                <Link 
                  key={genre.id} 
                  to={`/search?genreId=${genre.id}`}
                  className="genre-card"
                >
                  <span className="genre-name">{genre.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Películas por categorías/géneros */}
      {!loading && !error && genres.slice(0, 4).map(genre => {
        const movies = genreMovies[genre.id] || [];
        if (movies.length === 0) return null;
        
        return (
          <section key={genre.id} className="content-row">
            <div className="container">
              <div className="row-header">
                <h2>{genre.name}</h2>
                <Link to={`/search?genreId=${genre.id}`} className="see-all">Ver todo →</Link>
              </div>
              <div className="carousel">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {loading && (
        <div className="container" style={{padding:'100px 24px', textAlign:'center'}}>
          <Spinner /> <span style={{marginLeft:12}}>Cargando contenido...</span>
        </div>
      )}
      {error && !loading && (
        <div className="container" style={{padding:'100px 24px'}}>
          <div className="card" role="alert" style={{padding:24, textAlign:'center'}}>{error}</div>
        </div>
      )}
    </>
  );
}


