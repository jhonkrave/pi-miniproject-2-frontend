import { useAuth } from '../../context/AuthContext';
import { FormEvent, useState } from 'react';
import { api, isValidEmail } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Edit Profile component for LumiFlix - mini project 2
 * 
 * This component provides user profile editing functionality allowing authenticated users
 * to update their personal information including name, age, and email address. It manages
 * form validation, API communication, and user context updates for profile modifications.
 * 
 * **Key Features:**
 * - Pre-populated form fields with current user data from authentication context
 * - Real-time form validation using utility functions (isValidEmail)
 * - Age validation with minimum age requirement (13+ years)
 * - API integration for user profile updates and modifications
 * - Loading states and comprehensive error handling with user feedback
 * - Automatic redirection to profile page after successful updates
 * - Authentication guard to ensure only logged-in users can access the form
 * - Accessibility features including ARIA attributes and proper form labels
 * - Cancel functionality to return to profile page without saving changes
 * - Form validation that prevents submission until all requirements are met
 * 
 * **Component States:**
 * - `firstName`: User's first name input (pre-populated from context)
 * - `lastName`: User's last name input (pre-populated from context)
 * - `age`: User's age input (pre-populated from context, minimum 13)
 * - `email`: User's email address input (pre-populated from context)
 * - `error`: Error message display for failed update attempts
 * - `loading`: Loading state during API communication
 * 
 * **Validation Requirements:**
 * - First name: Required, non-empty string
 * - Last name: Required, non-empty string
 * - Age: Required, numeric value, minimum 13 years
 * - Email: Required, valid email format using isValidEmail utility
 * 
 * **Authentication Requirements:**
 * - User must be authenticated to access this component
 * - Unauthenticated users are redirected with appropriate message
 * - Component relies on AuthContext for user data and authentication state
 * 
 * **Profile Update Flow:**
 * 1. Component loads with current user data pre-populated in form fields
 * 2. User modifies desired profile information
 * 3. Form validates all inputs in real-time
 * 4. Submit button is enabled only when all validations pass
 * 5. On submission: API updates user profile with new information
 * 6. On success: user context is updated and redirects to profile page
 * 7. On failure: appropriate error message is displayed
 * 
 * **Error Handling:**
 * - Duplicate email error (HTTP 409): "Este correo ya está registrado"
 * - General errors: Custom error message or fallback message
 * - Network errors: Graceful error handling with user feedback
 * - Authentication errors: Redirect to appropriate page with message
 * 
 * The component integrates with the AuthContext for user data management,
 * React Router for navigation, and the API service for profile updates.
 * 
 * @component
 * @returns {JSX.Element} The Edit Profile page component with pre-populated profile editing form
 * 
 * @example
 * ```tsx
 * import EditProfile from './pages/profile/EditProfile';
 * 
 * function App() {
 *   return <EditProfile />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState<number | ''>(user?.age || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <section className="grid"><h1>Editar perfil</h1><p>Debes iniciar sesión.</p></section>;

  const valid = firstName && lastName && typeof age === 'number' && age >= 13 && isValidEmail(email);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await api.updateProfile({ firstName, lastName, age: age as number, email });
      setUser(updated);
      navigate('/profile');
    } catch (err: any) { 
      setError(err?.status === 409 ? 'Este correo ya está registrado' : (err?.message || 'Error al actualizar el perfil.'));
    } finally { setLoading(false); }
  }

  return (
    <section style={{paddingTop: 64, paddingBottom: 64}}>
      <div className="container" style={{maxWidth: 720}}>
        <h1 style={{fontSize: 40, marginBottom: 40}}>Editar perfil</h1>
        <form onSubmit={onSubmit} className="card" style={{overflow: 'hidden', maxWidth: 560, margin: '0 auto'}}>
          <div className="field">
            <label htmlFor="firstName">Nombre</label>
            <input 
              id="firstName"
              value={firstName} 
              onChange={e=>setFirstName(e.target.value)} 
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
              onChange={e=>setLastName(e.target.value)} 
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
              onChange={e=>setAge(e.target.value ? Number(e.target.value) : '')} 
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
              onChange={e=>setEmail(e.target.value)} 
              placeholder="tu@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          {error && (
            <div className="error" role="alert" style={{marginBottom: 20}}>
              {error}
            </div>
          )}
          <div style={{display: 'flex', gap: 12, marginTop: 28}}>
            <button 
              disabled={!valid || loading}
              style={{flex: 1}}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button 
              type="button" 
              className="btn ghost" 
              style={{flex: 1}}
              onClick={() => navigate('/profile')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}


