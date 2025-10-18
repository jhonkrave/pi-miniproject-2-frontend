import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onLogout() {
    // Close menu immediately; navigate right away for snappy UX
    setOpen(false);
    navigate('/');
    // Fire and forget logout to avoid blocking UI; errors are non-critical here
    try { await logout(); } catch {}
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/">
          <img src="/logo.svg" alt="LumiFlix" width={24} height={24} style={{borderRadius: 6}} />
          LumiFlix
        </Link>
        <button className="nav-toggle" aria-label="Abrir menú" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav-menu ${open ? 'open' : ''}`} aria-label="Principal">
          <Link to="/" onClick={()=>setOpen(false)}>Inicio</Link>
          <Link to="/about" onClick={()=>setOpen(false)}>Sobre nosotros</Link>
          {!user && (
            <>
              <Link to="/login" className="btn ghost" onClick={()=>setOpen(false)}>Ingresar</Link>
              <Link to="/signup" className="btn" onClick={()=>setOpen(false)}>Crear cuenta</Link>
            </>
          )}
          {user && (
            <div className="nav-user">
              <Link to="/profile" onClick={()=>setOpen(false)}>
                Perfil
              </Link>
              <button className="btn ghost" onClick={onLogout}>Cerrar sesión</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}


