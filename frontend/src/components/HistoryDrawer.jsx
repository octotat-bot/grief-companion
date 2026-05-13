// Replaces the old HistoryPanel. Slides in as an overlay drawer from the right.
// Does not push content — overlays it.

import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';

export default function HistoryDrawer({ onClose }) {
  const { history, loading, dbAvailable, deleteDraft } = useHistory();
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200
      }} />

      {/* Drawer */}
      <div className="fade-in" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '360px',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--divider)',
        display: 'flex', flexDirection: 'column',
        zIndex: 201
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <span className="ui-label ui-label-gold" style={{ display: 'block', marginBottom: '0.2rem' }}>Saved letters</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Archive</span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '1rem' }}>×</button>
        </div>

        {!dbAvailable && (
          <div style={{ margin: '0.75rem 1.5rem 0', padding: '0.6rem 0.85rem', border: '1px solid var(--gold-line)', borderRadius: '2px' }}>
            <span className="ui-label" style={{ color: 'var(--gold)' }}>MongoDB offline · history unavailable</span>
          </div>
        )}

        {/* List */}
        <div className="scrollable" style={{ flex: 1, padding: '0.75rem 1.5rem' }}>
          {loading && <p className="ui-label" style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.4 }}>Loading...</p>}
          {!loading && history.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>No saved letters yet.</p>
            </div>
          )}
          {history.map(d => (
            <div key={d._id} style={{ borderBottom: '1px solid var(--border)', padding: '0.85rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div>
                  <span className="ui-label" style={{ color: 'var(--gold)', display: 'block', marginBottom: '0.1rem' }}>
                    {d.userNote || d.formInput?.situation?.replace('_', ' ')}
                  </span>
                  <span className="ui-label" style={{ opacity: 0.6, color: 'var(--text-secondary)' }}>
                    {d.formInput?.relationship} · {d.formInput?.tone} · {new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <button onClick={() => deleteDraft(d._id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem',
                  opacity: 0.35, transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.35}>
                  ×
                </button>
              </div>
              <button onClick={() => setExpanded(expanded === d._id ? null : d._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%' }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: expanded === d._id ? '0.9rem' : '0.82rem',
                  color: expanded === d._id ? 'var(--text-secondary)' : 'var(--text-tertiary)', lineHeight: '1.65',
                  whiteSpace: expanded === d._id ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden', textOverflow: expanded === d._id ? 'unset' : 'ellipsis',
                  marginTop: '0.25rem'
                }}>
                  {d.editedDraft || d.draft}
                </p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
