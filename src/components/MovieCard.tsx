import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type MovieItem } from '@/lib/api';
import Spinner from './Spinner';
import { useAuth } from '@/context/AuthContext';
import { HeartIcon } from './Icons';
import { useFavorites } from '@/context/FavoritesContext';

type Props = {
  movie: MovieItem;
  onFavorited?: (movieId: number, added: boolean) => void;
  isFavorite?: boolean;
  asList?: boolean;
};

export default function MovieCard({ movie, onFavorited, isFavorite = false, asList = false }: Props) {
  const { user } = useAuth();
  const { isFavorite: isFav, toggle } = useFavorites();
  const [loadingFav, setLoadingFav] = useState(false);

  async function toggleFavorite() {
    if (!user) {
      alert('Debes iniciar sesión para gestionar favoritos.');
      return;
    }
    setLoadingFav(true);
    try {
      const wasFav = isFav(movie.id);
      await toggle(movie);
      const nowFav = !wasFav;
      onFavorited?.(movie.id, nowFav);
    } catch (e: any) {
      alert(e?.message || 'No se pudo actualizar favoritos');
    } finally { setLoadingFav(false); }
  }

  const poster = movie.poster || movie.backdrop;
  const firstGenre = movie.genres && movie.genres.length > 0 ? movie.genres[0].name : undefined;

  if (asList) {
    return (
      <div className="card movie-row" style={{display:'grid', gridTemplateColumns:'120px 1fr auto', gap:16, padding:12, alignItems:'center'}}>
        <img src={poster || '/logo.svg'} alt={movie.title} style={{width:120, height:72, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)'}} />
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700}}>{movie.title}</div>
          <div style={{fontSize:12, color:'var(--text-muted)'}}>{movie.year || ''}</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <Link to={`/watch/${movie.id}`}><button className="ghost" aria-label={`Ver ${movie.title}`}>Ver</button></Link>
          <button onClick={toggleFavorite} aria-pressed={isFav(movie.id)} aria-label={isFav(movie.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'} className="ghost" disabled={loadingFav}>
            {loadingFav ? <Spinner size={14} /> : (isFav(movie.id) ? '★' : '☆')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-card">
      <Link to={`/watch/${movie.id}`} className="movie-card-link" aria-label={`Ver ${movie.title}`}>
        <div className="movie-card-poster" style={{backgroundImage: poster ? `url(${poster})` : undefined}}>
          {!poster && <div className="movie-card-poster-fallback" />}
          <div className="movie-card-overlay">
            <div className="movie-card-info">
              <h3 className="movie-card-title">{movie.title}</h3>
              <div className="movie-card-meta">
                {movie.year && <span className="movie-card-year">{movie.year}</span>}
                {firstGenre && <span className="movie-card-genre">{firstGenre}</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {user && (
        <button 
          onClick={toggleFavorite}
          className={`movie-card-favorite ${isFav(movie.id) ? 'is-favorite' : ''}`}
          aria-label={isFav(movie.id) ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
          aria-pressed={isFav(movie.id)}
          disabled={loadingFav}
        >
          {loadingFav ? <Spinner size={16} color="white" /> : <HeartIcon size={18} filled={isFav(movie.id)} />}
        </button>
      )}

    </div>
  );
}


