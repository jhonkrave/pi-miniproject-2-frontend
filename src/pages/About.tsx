
/**
 * About component for LumiFlix - mini project 2
 * 
 * This component renders the "About" page that provides information about the LumiFlix platform.
 * It displays three main sections explaining the platform's value proposition, privacy and security features,
 * and the reasons to choose LumiFlix for streaming entertainment.
 * 
 * The component uses inline styles for layout and styling, creating a centered container with
 * responsive card-based sections that describe the platform's key features and benefits.
 * 
 * @component
 * @returns {JSX.Element} The About page component with platform information
 * 
 * @example
 * ```tsx
 * import About from './pages/About';
 * 
 * function App() {
 *   return <About />;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export default function About() {
  return (
    <section style={{paddingTop: 64, paddingBottom: 64}}>
      <div className="container" style={{maxWidth: 800}}>
        <h1 style={{fontSize: 40, marginBottom: 40, textAlign: 'center'}}>Sobre LumiFlix</h1>

        <div className="card" style={{marginBottom: 24}}>
          <h2 style={{fontSize: 22, marginBottom: 16}}>Nuestra propuesta</h2>
          <p style={{color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0}}>
            Disfruta de una experiencia de streaming moderna, rápida y pensada para ti. 
            Interfaz clara, accesible y adaptable para que encuentres lo que quieres ver sin complicaciones.
          </p>
        </div>

        <div className="card" style={{marginBottom: 24}}>
          <h2 style={{fontSize: 22, marginBottom: 16}}>Privacidad y seguridad</h2>
          <p style={{color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0}}>
            Cuidamos tus datos y te damos el control de tu cuenta en todo momento. 
            Puedes actualizar tu información y gestionar tu perfil fácilmente.
          </p>
        </div>

        <div className="card">
          <h2 style={{fontSize: 22, marginBottom: 16}}>¿Por qué LumiFlix?</h2>
          <p style={{color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0}}>
            Buscamos una experiencia fluida, con un diseño cuidado y una navegación sencilla. 
            Queremos que encuentres algo para ver en menos tiempo y con menos fricción.
          </p>
        </div>
      </div>
    </section>
  );
}


