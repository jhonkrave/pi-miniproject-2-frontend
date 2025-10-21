import { Link } from 'react-router-dom';

/**
 * Sitemap component for LumiFlix - mini project 2
 * 
 * This component renders a comprehensive sitemap page that provides users with
 * an organized overview of all available pages and sections within the LumiFlix platform.
 * The sitemap is structured into three main categories for better navigation:
 * 
 * 1. **Public Pages**: Contains links to publicly accessible pages including
 *    home, about, login, signup, and password recovery pages.
 * 
 * 2. **Account Pages**: Displays user-specific pages such as profile view
 *    and profile editing functionality (requires authentication).
 * 
 * 3. **Utility Pages**: Includes utility and informational pages like the
 *    sitemap itself and contact information.
 * 
 * The component uses a responsive grid layout with card-based sections to
 * present the navigation structure in an organized and user-friendly manner.
 * All internal links use React Router's Link component for client-side navigation.
 * 
 * @component
 * @returns {JSX.Element} The Sitemap page component with organized navigation links
 * 
 * @example
 * ```tsx
 * import Sitemap from './pages/Sitemap';
 * 
 * function App() {
 *   return <Sitemap />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function Sitemap() {
  return (
    <section style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1 style={{ fontSize: 36, marginBottom: 24 }}>Mapa del sitio</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Navega todas las páginas disponibles en LumiFlix.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Páginas públicas</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: 10 }}><Link to="/">Inicio</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/about">Sobre nosotros</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/login">Ingresar</Link></li>
              <li style={{ marginBottom: 10 }}><Link to="/signup">Crear cuenta</Link></li>
              <li style={{ marginBottom: 0 }}><Link to="/forgot-password">Recuperar contraseña</Link></li>
            </ul>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Páginas de cuenta</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: 10 }}><Link to="/profile">Perfil</Link></li>
              <li style={{ marginBottom: 0 }}><Link to="/profile/edit">Editar perfil</Link></li>
            </ul>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Utilidad</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)' }}>
              <li style={{ marginBottom: 10 }}><Link to="/sitemap">Mapa del sitio</Link></li>
              <li style={{ marginBottom: 0 }}><a href="mailto:noreply@lumiflix.com">Contacto</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


