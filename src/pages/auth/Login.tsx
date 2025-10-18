import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede a tu cuenta">
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required 
            disabled={loading}
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div role="alert" className="error" aria-live="polite" style={{marginBottom: 20}}>
            {error}
          </div>
        )}
        <button 
          disabled={loading || !email || !password} 
          style={{marginTop: 24, width: '100%'}}
        >
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
        <div style={{marginTop: 20, textAlign: 'center'}}>
          <Link to="/forgot-password" style={{fontSize: '14px'}}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div style={{marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center'}}>
          <span style={{color: 'var(--text-secondary)', fontSize: '14px'}}>¿No tienes cuenta? </span>
          <Link to="/signup" style={{fontWeight: 500}}>Regístrate</Link>
        </div>
      </form>
    </AuthLayout>
  );
}


