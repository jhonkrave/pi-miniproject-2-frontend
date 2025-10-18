import { Link } from 'react-router-dom';

/**
 * Home component for LumiFlix - mini project 2
 * 
 * This component renders the main welcoming page of the LumiFlix streaming platform.
 * It consists of three main sections that provide an engaging user experience:
 * 
 * 1. **Hero Section**: Features the main title, tagline, and call-to-action buttons
 *    for user registration and information about the platform.
 * 
 * 2. **Showcase Section**: Displays a grid of placeholder content cards with
 *    gradient backgrounds and skeleton loading elements to simulate a content library.
 * 
 * 3. **Call-to-Action Section**: Contains a prominent banner encouraging users
 *    to create an account or log in to access platform features.
 * 
 * The component uses inline styles for responsive design and creates an attractive
 * landing page that introduces new users to the LumiFlix platform.
 * 
 * @component
 * @returns {JSX.Element} The Home page component with hero, showcase, and CTA sections
 * 
 * @example
 * ```tsx
 * import Home from './pages/Home';
 * 
 * function App() {
 *   return <Home />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function Home() {
  return (
    <>
      {/* Hero */}
      <section style={{paddingTop: 100, paddingBottom: 100}}>
        <div className="container" style={{textAlign: 'center', maxWidth: 700}}>
          <h1 style={{fontSize: 56, marginBottom: 16, letterSpacing: '-0.02em'}}>
            LumiFlix
          </h1>
          <p style={{fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.7}}>
            Plataforma de streaming con gestión de usuarios, acceso seguro y experiencia cinematográfica.
          </p>
          <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/signup">
              <button>Comenzar</button>
            </Link>
            <Link to="/about">
              <button className="ghost">Más información</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section style={{paddingTop: 80, paddingBottom: 80}}>
        <div className="container">
          <h2 style={{textAlign: 'center', marginBottom: 32, fontSize: 36}}>Tu cine, en casa</h2>
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 40}}>Explora contenido con una experiencia fluida y moderna.</p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20}}>
            {new Array(8).fill(0).map((_, i) => (
              <div key={i} className="card" style={{padding: 0, overflow: 'hidden'}}>
                <div style={{aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(99,102,241,.18), rgba(6,182,212,.14))'}} />
                <div style={{padding: 16}}>
                  <div style={{height: 16, width: '60%', background: 'rgba(255,255,255,.08)', borderRadius: 8, marginBottom: 8}} />
                  <div style={{height: 12, width: '40%', background: 'rgba(255,255,255,.06)', borderRadius: 8}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{paddingTop: 80, paddingBottom: 80}}>
        <div className="container">
          <div style={{
            padding: 56,
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
            borderRadius: 12,
          }}>
            <h2 style={{color: 'white', marginBottom: 16, fontSize: 32}}>¿Listo para comenzar?</h2>
            <p style={{color: 'rgba(255, 255, 255, 0.9)', marginBottom: 32, fontSize: 16}}>
              Crea una cuenta en segundos y accede a todas las funcionalidades
            </p>
            <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
              <Link to="/signup">
                <button style={{background: 'white', color: 'var(--brand)'}}>Crear Cuenta</button>
              </Link>
              <Link to="/login">
                <button className="ghost" style={{borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white'}}>Inicia sesión</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


