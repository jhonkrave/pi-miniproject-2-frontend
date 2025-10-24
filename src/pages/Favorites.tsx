import { useEffect, useState } from 'react';
import { type MovieItem } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import Spinner from '@/components/Spinner';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';

export default function Favorites() {
  const { favorites, loading, error, refresh } = useFavorites();
  const [movies, setMovies] = useState<MovieItem[]>([]);

  useEffect(() => { setMovies(favorites); }, [favorites]);
  useEffect(() => { refresh(); }, [refresh]);

  function onFavorited(movieId: number, added: boolean) {
    if (!added) setMovies(prev => prev.filter(m => m.id !== movieId));
  }

  return (
    <>
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <h1>Mis favoritos</h1>
            <p>Tus películas guardadas para ver más tarde</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="content-row">
        <div className="container">
          {loading && (
            <div className="loading-state">
              <Spinner /> 
              <span>Cargando favoritos...</span>
            </div>
          )}
          
          {error && !loading && (
            <div className="error-state" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            movies.length === 0 ? (
              <div className="empty-state">
                <h2>Aún no tienes favoritos</h2>
                <p>Explora el catálogo y agrega películas a tus favoritos</p>
                <Link to="/movies">
                  <button>Explorar catálogo</button>
                </Link>
              </div>
            ) : (
              <div className="catalog-grid">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m} onFavorited={onFavorited} isFavorite />
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}


