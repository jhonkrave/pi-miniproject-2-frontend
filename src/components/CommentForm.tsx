import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';

/**
 * CommentForm component for LumiFlix - mini project 2
 * 
 * Form to create a new comment for a movie.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string|number} props.movieId - Movie ID
 * @param {Function} props.onCommentAdded - Callback when comment is successfully created
 * @returns {JSX.Element} The CommentForm component
 * 
 * @since 3.0.0
 */
type CommentFormProps = {
  movieId: string | number;
  onCommentAdded: () => void;
};

export default function CommentForm({ movieId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para comentar');
      return;
    }

    if (!text.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createComment({ movieId, text: text.trim() });
      setText('');
      onCommentAdded();
    } catch (e: any) {
      if (e?.status === 401) {
        setError('Debes iniciar sesión para comentar');
      } else {
        setError(e?.message || 'No se pudo crear el comentario');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="comment-form-login">
        <p>Debes iniciar sesión para dejar un comentario.</p>
      </div>
    );
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-form-header">
        <h3>Deja un comentario</h3>
      </div>
      <div className="comment-form-body">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder="Escribe tu comentario..."
          rows={4}
          disabled={loading}
          className="comment-form-textarea"
          required
        />
        {error && (
          <div className="comment-form-error" role="alert">
            {error}
          </div>
        )}
      </div>
      <div className="comment-form-footer">
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Spinner size={16} /> Publicando...
            </>
          ) : (
            'Publicar comentario'
          )}
        </button>
      </div>
    </form>
  );
}



