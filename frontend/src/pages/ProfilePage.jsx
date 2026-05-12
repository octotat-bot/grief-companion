import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBar from '../components/StatusBar';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    }
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ background: 'var(--ink)', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 1.5rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        <header className="fade-up" style={{ marginBottom: '3rem' }}>
          <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--parch-ghost)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}
             onMouseEnter={e => e.target.style.color = 'var(--gold)'}
             onMouseLeave={e => e.target.style.color = 'var(--parch-ghost)'}>
            ← Back to Compose
          </a>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem', color: 'var(--parch)' }}>
            Your Profile
          </h1>
        </header>

        <div className="fade-up delay-200" style={{
          background: 'var(--ink-soft)',
          border: '1px solid var(--ink-border)',
          borderRadius: '2px',
          padding: '2.5rem',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Grain */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <div>
              <span className="type-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--parch)' }}>{user.name || 'Anonymous'}</p>
            </div>
            <div className="divider" />
            <div>
              <span className="type-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--parch)' }}>{user.email}</p>
            </div>
            <div className="divider" />
            <div>
              <span className="type-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Account Status</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--success)' }}>Active</p>
            </div>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ink-border)', position: 'relative' }}>
            <button onClick={() => { logout(); window.location.href = '/'; }} className="ghost-btn" style={{ color: 'var(--error)', borderColor: 'rgba(139,58,58,0.4)' }}>
              Sign Out Completely
            </button>
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
