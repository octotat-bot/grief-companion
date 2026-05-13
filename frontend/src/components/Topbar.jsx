// Fixed 48px topbar — wordmark left, actions right.
// Replaces the old centered header inside the main container.

import React from 'react';
import UserMenu from './UserMenu';

export default function Topbar({ onHistoryOpen }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--topbar-h)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--divider)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 100
    }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-primary)'
        }}>
          Grief Language <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Companion</span>
        </span>
        {/* Gold dot separator */}
        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.6, display: 'inline-block', marginBottom: '2px' }} />
        <span className="ui-label" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>A writing instrument</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <UserMenu />
        <div style={{ width: '1px', height: '16px', background: 'var(--divider)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={onHistoryOpen} className="btn-ghost" style={{ padding: '0.4rem 0.85rem' }}>
            Archive
          </button>
          <a href="/admin" className="btn-ghost" style={{ padding: '0.4rem 0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
