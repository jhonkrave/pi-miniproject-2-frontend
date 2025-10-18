import { useAuth } from '../../context/AuthContext';
import { FormEvent, useState } from 'react';
import { api, isValidEmail } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';

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


