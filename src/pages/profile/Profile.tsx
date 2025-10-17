import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useState } from 'react';
import Modal from '../../components/Modal';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  if (!user) return (
    <section className="grid"><h1>Perfil</h1><p>Debes iniciar sesión.</p></section>
  );

  async function onDelete() {
    if (password !== 'ELIMINAR') {
      setError('Debes escribir ELIMINAR');
      return;
    }
    setError(null);
    setLoadingDelete(true);
    try {
      await api.deleteMe({ password, confirmation: 'ELIMINAR' });
      await logout();
      navigate('/');
    } catch (err: any) { 
      setError(err?.message || 'Error al eliminar la cuenta.');
    } finally { setLoadingDelete(false); }
  }

  return (
    <section style={{paddingTop: 64, paddingBottom: 64}}>
      <div className="container" style={{maxWidth: 800}}>
        <h1 style={{fontSize: 40, marginBottom: 24}}>Perfil</h1>

        <div className="card profile-card" style={{marginBottom: 24}}>
          <div className="profile-header">
            <div className="profile-avatar" aria-hidden>
              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
            </div>
            <div className="profile-meta">
              <h2>{user.firstName} {user.lastName}</h2>
              <div className="email">{user.email}</div>
              <div className="since">Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail">
              <label>Nombre</label>
              <div className="value">{user.firstName}</div>
            </div>
            <div className="detail">
              <label>Apellido</label>
              <div className="value">{user.lastName}</div>
            </div>
            <div className="detail">
              <label>Edad</label>
              <div className="value">{user.age} años</div>
            </div>
            <div className="detail">
              <label>Correo</label>
              <div className="value" style={{wordBreak: 'break-all'}}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
          <Link to="/profile/edit" style={{flex: 1, maxWidth: 240}}>
            <button style={{width: '100%'}}>Editar perfil</button>
          </Link>
          <button 
            onClick={() => setShowDelete(true)} 
            style={{background: 'var(--danger)', width: '100%', flex: 1, maxWidth: 240}}
          >
            Eliminar
          </button>
        </div>
      </div>

      <Modal open={showDelete} title="Eliminar cuenta" onClose={()=>setShowDelete(false)}>
        <div style={{marginBottom: 20}}>
          <p style={{color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6}}>
            Esta acción es irreversible. Escribe "ELIMINAR" para confirmar.
          </p>
          <div className="field">
            <label htmlFor="delete-confirm">Escribe ELIMINAR</label>
            <input 
              id="delete-confirm"
              type="text" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              placeholder="ELIMINAR"
              disabled={loadingDelete}
            />
          </div>
          {error && (
            <div className="error" role="alert" style={{marginBottom: 20}}>
              {error}
            </div>
          )}
        </div>
        <div style={{display:'flex', gap: 12}}>
          <button 
            onClick={onDelete} 
            disabled={password !== 'ELIMINAR' || loadingDelete}
            style={{background: 'var(--danger)', flex: 1}}
          >
            {loadingDelete ? 'Eliminando...' : 'Eliminar cuenta'}
          </button>
          <button 
            className="btn ghost" 
            onClick={()=>{ setShowDelete(false); setPassword(''); setError(null); }} 
            style={{flex: 1}}
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </section>
  );
}


