import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
        <a href="/auth" style={{ ...labelStyle, color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s', padding: '0.5rem' }}
           onMouseEnter={e => e.target.style.color = 'var(--gold)'}
           onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}>
          Sign In / Create Account
        </a>
      </div>
    );
  }

  return (
    <div style={menuStyle} className="fade-in">
      <a href="/profile" style={{ ...labelStyle, color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.2s', padding: '0.5rem' }}
         onMouseEnter={e => e.target.style.color = 'var(--gold)'}
         onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>
        {user.name || user.email}
      </a>
      <div style={{ width: '1px', height: '12px', background: 'var(--divider)' }} />
      <button onClick={handleLogout} style={{ ...labelStyle, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem' }}
              onMouseEnter={e => e.target.style.color = 'var(--error)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}>
        Sign Out
      </button>
    </div>
  );
}
