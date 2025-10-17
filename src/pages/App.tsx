import { Routes, Route, Navigate } from 'react-router-dom';
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

function Shell() {
  return (
    <div>
      <Navbar />

      <main className="container" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign:'left'}}>
          <div>
            <div style={{fontWeight:700, color:'var(--text)'}}>LumiFlix</div>
            <div style={{color:'var(--text-muted)'}}>© {new Date().getFullYear()} Todos los derechos reservados</div>
          </div>
          <div>
            <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Páginas</div>
            <div style={{display:'grid', gap: 6}}>
              <a href="/">Inicio</a>
              <a href="/about">Sobre nosotros</a>
              <a href="/login">Ingresar</a>
              <a href="/signup">Crear cuenta</a>
            </div>
          </div>
          <div>
            <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Cuenta</div>
            <div style={{display:'grid', gap: 6}}>
              <a href="/profile">Perfil</a>
              <a href="/profile/edit">Editar perfil</a>
              <a href="/forgot-password">Recuperar contraseña</a>
            </div>
          </div>
          <div>
            <div style={{fontWeight:700, color:'var(--text)', marginBottom: 8}}>Utilidad</div>
            <div style={{display:'grid', gap: 6}}>
              <a href="/sitemap">Mapa del sitio</a>
              <a href="mailto:noreply@lumiflix.com">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() { return <Shell />; }


