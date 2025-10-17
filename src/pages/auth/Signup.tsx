import { FormEvent, useState } from 'react';
import { api, isStrongPassword, isValidEmail } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = firstName && lastName && typeof age === 'number' && age >= 13 && isValidEmail(email) && isStrongPassword(password);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setLoading(true);
    try {
      await api.signup({ firstName, lastName, age: age as number, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err?.status === 409 ? 'Este correo ya está registrado' : (err?.message || 'No pudimos crear tu cuenta. Intenta más tarde.'));
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete hoy" center={false}>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="firstName">Nombre</label>
            <input 
              id="firstName" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)}
              placeholder="Juan"
              required 
              disabled={loading}
              autoComplete="given-name"
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Apellido</label>
            <input 
              id="lastName" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)}
              placeholder="Pérez"
              required 
              disabled={loading}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="grid cols-2">
          <div className="field">
            <label htmlFor="age">Edad</label>
            <input 
              id="age" 
              type="number" 
              min={13} 
              value={age} 
              onChange={e => setAge(e.target.value ? Number(e.target.value) : '')} 
              placeholder="18"
              required 
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Correo</label>
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
            aria-describedby="pwd-help"
            disabled={loading}
            autoComplete="new-password"
          />
          <div id="pwd-help" className="muted" aria-live="polite">
            Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
          </div>
        </div>
        {error && (
          <div role="alert" className="error" aria-live="polite" style={{marginBottom: 20}}>
            {error}
          </div>
        )}
        <button 
          disabled={!valid || loading} 
          style={{marginTop: 24, width: '100%'}}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <div style={{marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center'}}>
          <span style={{color: 'var(--text-secondary)', fontSize: '14px'}}>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{fontWeight: 500}}>Inicia sesión</Link>
        </div>
      </form>
    </AuthLayout>
  );
}


