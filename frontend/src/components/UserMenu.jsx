import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuStyle = {
    position: 'absolute',
    top: '1.25rem',
    left: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    zIndex: 100,
  };

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.55rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };

  if (!user) {
    return (
      <div style={menuStyle} className="fade-in">
        <a href="/auth" style={{ ...labelStyle, color: 'var(--parch-ghost)', textDecoration: 'none', transition: 'color 0.2s', padding: '0.5rem' }}
           onMouseEnter={e => e.target.style.color = 'var(--gold)'}
           onMouseLeave={e => e.target.style.color = 'var(--parch-ghost)'}>
          Sign In / Create Account
        </a>
      </div>
    );
  }

  return (
    <div style={menuStyle} className="fade-in">
      <a href="/profile" style={{ ...labelStyle, color: 'var(--parch)', textDecoration: 'none', transition: 'color 0.2s', padding: '0.5rem' }}
         onMouseEnter={e => e.target.style.color = 'var(--gold)'}
         onMouseLeave={e => e.target.style.color = 'var(--parch)'}>
        {user.name || user.email}
      </a>
      <div style={{ width: '1px', height: '12px', background: 'var(--ink-border)' }} />
      <button onClick={handleLogout} style={{ ...labelStyle, background: 'none', border: 'none', color: 'var(--parch-ghost)', cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem' }}
              onMouseEnter={e => e.target.style.color = 'var(--error)'}
              onMouseLeave={e => e.target.style.color = 'var(--parch-ghost)'}>
        Sign Out
      </button>
    </div>
  );
}
