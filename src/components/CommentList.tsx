import { useEffect, useState } from 'react';
import { api, type Comment } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import Spinner from './Spinner';

/**
 * CommentList component for LumiFlix - mini project 2
 * 
 * Displays a list of comments for a movie and allows adding new comments.
 * Handles authentication errors and redirects to login if needed.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.movieId - Movie ID
 * @returns {JSX.Element} The CommentList component
 * 
 * @since 3.0.0
 */
type CommentListProps = {
  movieId: string | number;
};

export default function CommentList({ movieId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  /**
   * Load comments from API
   */
  async function loadComments() {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMovieComments(movieId);
      setComments(data);
    } catch (e: any) {
      // Handle 401 - only redirect if user was previously logged in (token expired)
      // If user is not logged in, comments might just be empty or require auth
      if (e?.status === 401) {
        // Only redirect if user exists in context and we're not initializing
        // This prevents redirects during page load/auth initialization
        if (user) {
          // Try to refresh auth, if that fails, then redirect
          try {
            await refresh();
            // If refresh succeeds, retry loading comments
            const retryData = await api.getMovieComments(movieId);
            setComments(retryData);
            return;
          } catch (refreshError: any) {
            // Only redirect if refresh fails with 401 (token truly expired)
            // Don't redirect for network errors or other issues
            if (refreshError?.status === 401) {
              navigate('/login', { 
                state: { message: 'Inicia sesión de nuevo' },
                replace: false 
              });
              return;
            }
            // For other errors, just show error
            setError('No se pudieron cargar los comentarios');
            return;
          }
        }
        // If no user, just show empty comments or error (don't redirect)
        // Comments endpoint might be public, so return empty array
        setComments([]);
        return;
      }
      
      // Handle 5xx errors with user-friendly message
      if (e?.status >= 500) {
        setError('No pudimos obtener los comentarios, inténtalo más tarde');
        return;
      }
      
      // Other errors - don't redirect, just show error
      setError(e?.message || 'No se pudieron cargar los comentarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  /**
   * Handle comment update
   */
  function handleCommentUpdate(updatedComment: Comment) {
    setComments(prev => 
      prev.map(c => c._id === updatedComment._id ? updatedComment : c)
    );
  }

  /**
   * Handle comment delete
   */
  function handleCommentDelete(commentId: string) {
    setComments(prev => prev.filter(c => c._id !== commentId));
  }

  /**
   * Handle new comment added
   */
  function handleCommentAdded() {
    loadComments();
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h2>Comentarios ({comments.length})</h2>
      </div>

      <CommentForm movieId={movieId} onCommentAdded={handleCommentAdded} />

      {loading && (
        <div className="comment-loading-container">
          <Spinner size={32} />
          <p>Cargando comentarios...</p>
        </div>
      )}

      {error && !loading && (
        <div className="comment-error-container" role="alert">
          <p>{error}</p>
          <button onClick={loadComments} className="btn-secondary">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="comment-list">
          {comments.length === 0 ? (
            <div className="comment-empty">
              <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

