import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { SearchIcon, HomeIcon, HeartIcon, UserIcon, InfoIcon, LogoutIcon, MenuIcon, CloseIcon } from './Icons';

/**
 * Navbar component for LumiFlix - mini project 2
 * 
 * This component is used to render the navigation bar.
 * 
 * @component
 * @returns {JSX.Element} The Navbar component with the navigation bar
 * 
 * @since 1.0.0
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [open]);

  async function onLogout() {
    // Close menu immediately; navigate right away for snappy UX
    setOpen(false);
    navigate('/');
    // Fire and forget logout to avoid blocking UI; errors are non-critical here
    try { await logout(); } catch {}
  }

  const isActive = (path: string) => location.pathname === path;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setOpen(false);
    } else {
      navigate('/search');
      setOpen(false);
    }
  }

  return (
    <>
      {/* Desktop Sidebar removed in favor of top navbar with right-side menu */}

      {/* Mobile Top Nav */}
      <header className={`mobile-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link className="mobile-brand" to="/" onClick={()=>setOpen(false)}>
          <img src="/logo.svg" alt="LumiFlix" width={24} height={24} style={{borderRadius: 6}} />
          <span>LumiFlix</span>
        </Link>

        <div className="mobile-actions">
          {user && (
            <Link to="/search" className="mobile-search-btn" aria-label="Buscar">
              <SearchIcon size={20} />
            </Link>
          )}
          
          <button 
            className="mobile-menu-btn"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open} 
            onClick={()=>setOpen(v=>!v)}
          >
            {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu - Separate from header */}
      {open && (
        <div className="mobile-menu-overlay" onClick={()=>setOpen(false)}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()} aria-label="Menú principal">
            <Link 
              to="/" 
              onClick={()=>setOpen(false)}
              className={`mobile-menu-item ${isActive('/') ? 'active' : ''}`}
            >
              <HomeIcon size={20} />
              <span>Inicio</span>
            </Link>
            
            {user && (
              <Link 
                to="/search" 
                onClick={()=>setOpen(false)}
                className={`mobile-menu-item ${isActive('/search') ? 'active' : ''}`}
              >
                <SearchIcon size={20} />
                <span>Buscar</span>
              </Link>
            )}
            
            {user && (
              <Link 
                to="/favorites" 
                onClick={()=>setOpen(false)}
                className={`mobile-menu-item ${isActive('/favorites') ? 'active' : ''}`}
              >
                <HeartIcon size={20} />
                <span>Favoritos</span>
              </Link>
            )}
            
            <Link 
              to="/about" 
              onClick={()=>setOpen(false)}
              className={`mobile-menu-item ${isActive('/about') ? 'active' : ''}`}
            >
              <InfoIcon size={20} />
              <span>Sobre nosotros</span>
            </Link>

            <div className="mobile-menu-divider" />

            {!user ? (
              <>
                <Link to="/login" className="mobile-menu-item" onClick={()=>setOpen(false)}>
                  <UserIcon size={20} />
                  <span>Iniciar sesión</span>
                </Link>
                <Link to="/signup" className="mobile-menu-item primary" onClick={()=>setOpen(false)}>
                  <UserIcon size={20} />
                  <span>Crear cuenta</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="mobile-menu-item" onClick={()=>setOpen(false)}>
                  <UserIcon size={20} />
                  <span>Perfil</span>
                </Link>
                <button onClick={onLogout} className="mobile-menu-item">
                  <LogoutIcon size={20} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}


