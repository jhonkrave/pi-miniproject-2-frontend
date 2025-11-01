import { useEffect, useState, FormEvent } from 'react';
import { api, isStrongPassword } from '../../lib/api';
import AuthLayout from '../../components/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Password Reset component for LumiFlix - mini project 2
 * 
 * This component handles the password reset functionality for users who have received
 * a password reset link via email. It validates the reset token, provides a secure
 * password reset form, and manages the complete password update process.
 * 
 * **Key Features:**
 * - Automatic token extraction and validation from URL parameters
 * - Strong password validation using the isStrongPassword utility function
 * - Password confirmation matching with real-time validation feedback
 * - API integration for token verification and password reset requests
 * - Loading states and comprehensive error handling with user feedback
 * - Automatic redirection to login page after successful password update
 * - Accessibility features including ARIA attributes and proper form labels
 * - Visual feedback for different states: loading, valid, invalid, and success
 * 
 * **Component States:**
 * - `token`: Reset token extracted from URL parameters
 * - `valid`: Boolean flag indicating token validity (null = loading, true = valid, false = invalid)
 * - `password`: New password input from the user
 * - `confirm`: Password confirmation input for validation
 * - `message`: Success message displayed after successful password update
 * - `error`: Error message display for failed operations
 * - `loading`: Loading state during API communication
 * 
 * **Password Requirements:**
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 symbol
 * - Password confirmation must match
 * 
 * **Reset Flow:**
 * 1. Component extracts token from URL on mount
 * 2. Token is validated via API call
 * 3. If valid: password reset form is displayed
 * 4. User enters new password and confirmation
 * 5. Form validates password strength and matching
 * 6. On submission: API updates password and shows success message
 * 7. Automatic redirect to login page after delay
 * 
 * The component uses the AuthLayout wrapper for consistent authentication page styling
 * and integrates with React Router for navigation and URL parameter handling.
 * 
 * @component
 * @returns {JSX.Element} The Password Reset page component with token validation and password update form
 * 
 * @example
 * ```tsx
 * import Reset from './pages/auth/Reset';
 * 
 * function App() {
 *   return <Reset />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
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
        <form onSubmit={onSubmit} aria-busy={loading}>
          <div className="field">
            <label htmlFor="pwd">Nueva contraseña</label>
            <input 
              id="pwd" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              aria-describedby={`pwd-help${error || (confirm && confirm !== password) ? ' reset-error' : ''}`}
              aria-invalid={error ? 'true' : 'false'}
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
              aria-required="true"
              aria-describedby={confirm && confirm !== password ? 'pwd2-error' : undefined}
              aria-invalid={confirm && confirm !== password ? 'true' : 'false'}
              disabled={loading}
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <div id="pwd2-error" className="error" role="alert" aria-live="assertive" style={{marginTop: 8}}>
                Las contraseñas no coinciden
              </div>
            )}
          </div>
          {error && (
            <div 
              id="reset-error"
              role="alert" 
              className="error" 
              aria-live="assertive" 
              style={{marginBottom: 20}}
            >
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


