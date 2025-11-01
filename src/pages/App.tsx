import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './Home';
import About from '../pages/About';
import Sitemap from '../pages/Sitemap';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Forgot from '../pages/auth/Forgot';
import Reset from '../pages/auth/Reset';
import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Search from './Search';
import Watch from './Watch';
import Favorites from './Favorites';
import Spinner from '../components/Spinner';

/**
 * Shell component that defines the main layout for LumiFlix - mini project 2.
 * It includes the navigation bar, main routes, and footer. 
 * It also includes the RequireAuth component to protect routes that require authentication.
 *
 * @component
 * @returns {JSX.Element} The rendered application shell.
 * 
 * @example
 * ```tsx
 * import App from './pages/App';
 * 
 * function App() {
 *   return <App />;
 * }
 * ```
 * 
 * @since 1.0.0
 */

function Shell() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content" role="main">
        <div className="route-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
          <Route path="/watch/:id" element={<RequireAuth><Watch /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
          {/* Redirect old /movies route to /search */}
          <Route path="/movies" element={<Navigate to="/search" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>

        <footer className="footer">
          <div className="container" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign:'left'}}>
            <div>
              <div style={{fontWeight:700, color:'var(--text)'}}>LumiFlix</div>
              <div style={{color:'var(--text-muted)'}}>© {new Date().getFullYear()} Todos los derechos reservados</div>
            </div>
            <div>
              <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Páginas</div>
              <div style={{display:'grid', gap: 6}}>
                <Link to="/">Inicio</Link>
                <Link to="/about">Sobre nosotros</Link>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/signup">Crear cuenta</Link>
              </div>
            </div>
            <div>
              <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Cuenta</div>
              <div style={{display:'grid', gap: 6}}>
                <Link to="/profile">Perfil</Link>
                <Link to="/profile/edit">Editar perfil</Link>
                <Link to="/forgot-password">Recuperar contraseña</Link>
              </div>
            </div>
            <div>
              <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Utilidad</div>
              <div style={{display:'grid', gap: 6}}>
                <Link to="/sitemap">Mapa del sitio</Link>
                <a href="mailto:noreply@lumiflix.com">Contacto</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/**
 * RequireAuth component for LumiFlix - mini project 2
 * 
 * This component is used to protect routes that require authentication.
 * It checks if the user is authenticated and redirects to the login page if not.
 * It waits for auth initialization to complete before making a decision.
 * 
 * @component
 * @returns {JSX.Element} The RequireAuth component with protected routes
 * 
 * @example
 * ```tsx
 * import RequireAuth from './pages/App';
 * 
 * function App() {
 *   return <RequireAuth><Profile /></RequireAuth>;
 * }
 * ```
 * 
 * @since 1.0.0
 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, isInitializing } = useAuth();
  
  // Wait for auth initialization to complete before redirecting
  if (isInitializing) {
    return (
      <div className="container" style={{padding:'100px 24px', textAlign:'center'}}>
        <Spinner size={32} />
        <div style={{marginTop: 16, color: 'var(--text-secondary)'}}>Verificando autenticación...</div>
      </div>
    );
  }
  
  // Only redirect if initialization is complete and user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
  
/**
 * App component for LumiFlix - mini project 2
 * 
 * This component is the main entry point for LumiFlix - mini project 2.
 * It renders the Shell component which includes the navigation bar, main routes, and footer. 
 * It also includes the RequireAuth component to protect routes that require authentication.
 * 
 * @component
 * @returns {JSX.Element} The App component with the Shell layout
 * 
 * @example
 * ```tsx
 * import App from './pages/App';
 * 
 * function App() {
 *   return <App />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function App() { return <Shell />; }


