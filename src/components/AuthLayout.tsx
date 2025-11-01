/**
 * AuthLayout component for LumiFlix - mini project 2
 * 
 * This component is used to wrap the authentication pages.
 * It includes the title, subtitle, and children components.
 * 
 * @component
 * @returns {JSX.Element} The AuthLayout component with the title, subtitle, and children
 * 
 * @since 1.0.0
 */
type Props = {
  title: string;
  subtitle?: string;
  center?: boolean; // true => card centered; false => split hero layout
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, center = true, children }: Props) {
  if (center) {
    return (
      <section className="auth-shell">
        <div className="card auth-card" aria-labelledby="auth-title">
          <div className="auth-header">
            <div className="auth-icon" aria-hidden>🔒</div>
            <h1 id="auth-title" className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          <div className="auth-content">
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-split" aria-labelledby="auth-title">
      <div className="auth-split-hero" aria-hidden>
        <img src="/auth-hero.jpg" alt="" style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85}} />
      </div>
      <div className="auth-split-form">
        <h1 id="auth-title" className="auth-title big">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        <div className="card" style={{marginTop: 16}}>
          {children}
        </div>
      </div>
    </section>
  );
}


