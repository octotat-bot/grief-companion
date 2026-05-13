import React, { useState } from 'react';

export default function SourceSnippets({ examples }) {
  const [open, setOpen] = useState(false);
  if (!examples?.length) return null;

  return (
    <div style={{ marginBottom: '1rem', border: '1px solid var(--divider)', borderRadius: '2px' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ui-label">
          Archive references · {examples.length} retrieved
        </span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="fade-in">
          {examples.map((ex, i) => (
            <div key={i} style={{ padding: '1rem', borderTop: '1px solid var(--divider)', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="ui-label" style={{ opacity: 0.5 }}>
                  {ex.metadata?.type} · {ex.metadata?.relationship} · {ex.metadata?.tone}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                  {Math.round(ex.similarity * 100)}% match
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-tertiary)', lineHeight: '1.7' }}>
                "{ex.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
