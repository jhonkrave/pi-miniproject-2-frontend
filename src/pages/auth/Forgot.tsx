import { useState, FormEvent } from 'react';
import { api, isValidEmail } from '../../lib/api';
import AuthLayout from '../../components/AuthLayout';
import { Link } from 'react-router-dom';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const started = performance.now();
      // Frontend debug logs
      // eslint-disable-next-line no-console
      console.log('[Forgot] submitting', { email: cleanEmail });
      const resp = await api.forgotPassword({ email: cleanEmail });
      // eslint-disable-next-line no-console
      console.log('[Forgot] success', { ms: Math.round(performance.now() - started), resp });
      setDone(true);
    } catch (err: any) { 
      // eslint-disable-next-line no-console
      console.error('[Forgot] error', err);
      setError(err?.message || 'Error al enviar el correo.');
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviaremos un enlace">
      <form onSubmit={onSubmit}>
        {!done ? (
          <>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
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
            {error && (
              <div role="alert" className="error" aria-live="polite" style={{marginBottom: 20}}>
                {error}
              </div>
            )}
            <button 
              disabled={!isValidEmail(email) || loading}
              style={{marginTop: 24, width: '100%'}}
              onClick={() => {
                try {
                  // eslint-disable-next-line no-console
                  console.debug('[Forgot] click');
                } catch {}
              }}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </>
        ) : (
          <div style={{textAlign: 'center', padding: '40px 20px'}}>
            <h2 style={{fontSize: 24, margin: 0, marginBottom: 12}}>¡Enlace enviado!</h2>
            <p style={{color: 'var(--text-secondary)', lineHeight: 1.6}}>
              Revisa tu correo para recuperar tu contraseña. El enlace es válido por 1 hora.
            </p>
          </div>
        )}
        <div style={{marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center'}}>
          <Link to="/login" style={{fontSize: '14px'}}>
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}


