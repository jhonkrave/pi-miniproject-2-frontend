import { useState } from 'react';
import { api, type Comment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';
import Modal from './Modal';

/**
 * CommentItem component for LumiFlix - mini project 2
 * 
 * Displays a single comment with options to edit or delete if the user is the owner.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Comment} props.comment - The comment to display
 * @param {Function} props.onUpdate - Callback when comment is updated
 * @param {Function} props.onDelete - Callback when comment is deleted
 * @returns {JSX.Element} The CommentItem component
 * 
 * @since 3.0.0
 */
type CommentItemProps = {
  comment: Comment;
  onUpdate: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
};

export default function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = user?.id === comment.userId;

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
      if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
      if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Get user display name - prioritizes full name over email
   */
  const getUserName = () => {
    if (comment.user) {
      // Priority 1: Full name (firstName + lastName)
      if (comment.user.firstName && comment.user.lastName) {
        return `${comment.user.firstName} ${comment.user.lastName}`;
      }
      // Priority 2: First name only (if lastName is missing)
      if (comment.user.firstName) {
        return comment.user.firstName;
      }
      // Priority 3: Last name only (if firstName is missing)
      if (comment.user.lastName) {
        return comment.user.lastName;
      }
      // Priority 4: Username (if available)
      if (comment.user.username) {
        return comment.user.username;
      }
      // Last resort: Use email domain part (before @) as fallback
      // But this should rarely happen if backend sends proper user data
      if (comment.user.email) {
        return comment.user.email.split('@')[0];
      }
    }
    return 'Usuario anónimo';
  };

  /**
   * Handle save edit
   */
  async function handleSave() {
    if (!editText.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    if (editText.trim() === comment.text) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await api.updateComment(comment._id, editText.trim());
      onUpdate(updated);
      setIsEditing(false);
    } catch (e: any) {
      setError(e?.message || 'No se pudo actualizar el comentario');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle delete comment
   */
  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      await api.deleteComment(comment._id);
      onDelete(comment._id);
      setShowDeleteModal(false);
    } catch (e: any) {
      setError(e?.message || 'No se pudo eliminar el comentario');
      setLoading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="comment-item editing">
        <div className="comment-edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            disabled={loading}
            rows={3}
            className="comment-edit-textarea"
            placeholder="Escribe tu comentario..."
          />
          {error && (
            <div className="comment-error" role="alert">
              {error}
            </div>
          )}
          <div className="comment-edit-actions">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.text);
                setError(null);
              }}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !editText.trim()}
              className="btn-primary"
            >
              {loading ? <Spinner size={16} /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <div className="comment-avatar">
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <div className="comment-author-info">
            <span className="comment-author-name">{getUserName()}</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        {isOwner && !loading && (
          <div className="comment-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="comment-action-btn"
              aria-label="Editar comentario"
            >
              Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="comment-action-btn delete"
              aria-label="Eliminar comentario"
            >
              Eliminar
            </button>
          </div>
        )}
        {loading && (
          <div className="comment-loading">
            <Spinner size={16} />
          </div>
        )}
      </div>
      <div className="comment-body">
        <p>{comment.text}</p>
        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
          <span className="comment-edited">(editado)</span>
        )}
      </div>
      {error && !isEditing && (
        <div className="comment-error" role="alert">
          {error}
        </div>
      )}

      <Modal 
        open={showDeleteModal} 
        title="Eliminar comentario" 
        onClose={() => {
          setShowDeleteModal(false);
          setError(null);
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
          </p>
          {error && (
            <div className="error" role="alert" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ background: 'var(--danger)', flex: 1 }}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setError(null);
            }}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

