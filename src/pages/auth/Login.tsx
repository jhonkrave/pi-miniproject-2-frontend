import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';

/**
 * Login component for LumiFlix - mini project 2
 * 
 * This component provides user authentication functionality allowing existing users to sign in
 * to their accounts. It manages the login form with email and password validation, API communication,
 * and authentication state management.
 * 
 * **Key Features:**
 * - Email and password input validation with required field checks
 * - API integration for user authentication and login requests
 * - Authentication context integration for user state management
 * - Loading states and error handling with user feedback
 * - Automatic navigation to user profile upon successful login
 * - Accessibility features including ARIA attributes and proper form labels
 * - Links to password recovery and user registration pages
 * 
 * **Component States:**
 * - `email`: User's email input for authentication
 * - `password`: User's password input for authentication
 * - `loading`: Loading state during API communication
 * - `error`: Error message display for failed authentication attempts
 * 
 * **Authentication Flow:**
 * 1. User enters credentials and submits the form
 * 2. Component validates input and makes API request
 * 3. On success: user data is stored in context and redirects to profile
 * 4. On failure: error message is displayed to the user
 * 
 * The component uses the AuthLayout wrapper for consistent authentication page styling
 * and integrates with React Router for navigation and the AuthContext for state management.
 * 
 * @component
 * @returns {JSX.Element} The Login page component with authentication form
 * 
 * @example
 * ```tsx
 * import Login from './pages/auth/Login';
 * 
 * function App() {
 *   return <Login />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
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
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
    } finally { setLoading(false); }
  }

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede a tu cuenta">
      <form onSubmit={onSubmit} noValidate aria-busy={loading}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required 
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'login-error' : undefined}
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
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'login-error' : undefined}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div 
            id="login-error"
            role="alert" 
            className="error" 
            aria-live="assertive" 
            style={{marginBottom: 20}}
          >
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


