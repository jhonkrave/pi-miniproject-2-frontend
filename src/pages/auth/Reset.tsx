import { useEffect, useState, FormEvent } from 'react';
import { api, isStrongPassword } from '../../lib/api';
import AuthLayout from '../../components/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';

export default function Reset() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token') || '';
    setToken(t);
    if (t) {
      api.verifyResetToken(t).then(r => setValid(r.valid)).catch(() => setValid(false));
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await api.resetPassword({ token, newPassword: password });
      setMessage('Contraseña actualizada');
      setPassword('');
      setConfirm('');
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) { 
      setError(err?.message || 'Error al actualizar la contraseña.');
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout title="Actualizar contraseña" subtitle="Crea una nueva contraseña">
      {valid === false && (
        <div role="alert" className="error" style={{marginBottom: 20, padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)'}}>
          Enlace inválido o caducado. <Link to="/forgot-password">Solicita uno nuevo</Link>
        </div>
      )}
      {valid === null && (
        <div style={{padding: '20px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20}}>
          Verificando enlace...
        </div>
      )}
      {valid === true && (
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="pwd">Nueva contraseña</label>
            <input 
              id="pwd" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <div id="pwd-help" className="muted" aria-live="polite">
              Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
            </div>
          </div>
          <div className="field">
            <label htmlFor="pwd2">Confirmar contraseña</label>
            <input
              id="pwd2"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <div className="error" role="alert" style={{marginTop: 8}}>Las contraseñas no coinciden</div>
            )}
          </div>
          {error && (
            <div role="alert" className="error" aria-live="polite" style={{marginBottom: 20}}>
              {error}
            </div>
          )}
          {message && (
            <div aria-live="polite" style={{padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: 'var(--success)', marginBottom: 20, border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 500}}>
              {message}
            </div>
          )}
          <button 
            disabled={!isStrongPassword(password) || password !== confirm || loading}
            style={{marginTop: 24, width: '100%'}}
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      )}
      <div style={{marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center'}}>
        <Link to="/login" style={{fontSize: '14px'}}>
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}


