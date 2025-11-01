import { FormEvent, useState } from 'react';
import { api, isStrongPassword, isValidEmail } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';

/**
 * User Registration component for LumiFlix - mini project 2
 * 
 * This component provides user registration functionality allowing new users to create
 * accounts on the LumiFlix platform. It manages a comprehensive registration form with
 * personal information validation, secure password requirements, and API integration
 * for account creation.
 * 
 * **Key Features:**
 * - Complete user registration form with personal information fields
 * - Real-time form validation using utility functions (isValidEmail, isStrongPassword)
 * - Age validation with minimum age requirement (13+ years)
 * - API integration for user account creation and registration
 * - Loading states and comprehensive error handling with user feedback
 * - Automatic redirection to login page after successful registration
 * - Accessibility features including ARIA attributes and proper form labels
 * - Links to existing user login page for better user navigation
 * - Form validation that prevents submission until all requirements are met
 * 
 * **Component States:**
 * - `firstName`: User's first name input
 * - `lastName`: User's last name input
 * - `age`: User's age input (number, minimum 13)
 * - `email`: User's email address input
 * - `password`: User's password input with security requirements
 * - `loading`: Loading state during API communication
 * - `error`: Error message display for failed registration attempts
 * 
 * **Validation Requirements:**
 * - First name: Required, non-empty string
 * - Last name: Required, non-empty string
 * - Age: Required, numeric value, minimum 13 years
 * - Email: Required, valid email format using isValidEmail utility
 * - Password: Required, strong password using isStrongPassword utility
 * 
 * **Password Security Requirements:**
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 symbol
 * 
 * **Registration Flow:**
 * 1. User fills out all required registration fields
 * 2. Form validates all inputs in real-time
 * 3. Submit button is enabled only when all validations pass
 * 4. On submission: API creates user account
 * 5. On success: user is redirected to login page
 * 6. On failure: appropriate error message is displayed
 * 
 * **Error Handling:**
 * - Duplicate email error (HTTP 409): "Este correo ya está registrado"
 * - General errors: Custom error message or fallback message
 * - Network errors: Graceful error handling with user feedback
 * 
 * The component uses the AuthLayout wrapper for consistent authentication page styling
 * and integrates with React Router for navigation and the API service for user registration.
 * 
 * @component
 * @returns {JSX.Element} The User Registration page component with comprehensive signup form
 * 
 * @example
 * ```tsx
 * import Signup from './pages/auth/Signup';
 * 
 * function App() {
 *   return <Signup />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
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


