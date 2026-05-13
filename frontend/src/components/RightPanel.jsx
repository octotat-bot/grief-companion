// Right panel — shows idle state, loading (streaming), output, or A/B comparison.
// Fills remaining viewport. Zero page scroll. Internal scroll only for long drafts.

import React from 'react';
import OutputPanel from './OutputPanel';
import ABComparisonPanel from './ABComparisonPanel';
import FeedbackPanel from './FeedbackPanel';
import LoadingState from './LoadingState';

function IdleState() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      opacity: 0.4
    }}>
      {/* Decorative ornament */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, var(--gold))' }} />
        <div style={{ width: '6px', height: '6px', background: 'var(--gold)', transform: 'rotate(45deg)' }} />
        <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, var(--gold))' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7 }}>
        Fill in the form on the left<br />and your letter will appear here
      </p>
      <span className="ui-label" style={{ marginTop: '1rem', opacity: 0.5 }}>
        All processing is local · nothing leaves your machine
      </span>
    </div>
  );
}

export default function RightPanel({ view, result, abResult, streamingText, statusMessage, onReset, onSave, onCancel }) {
  return (
    <div style={{
      flex: 1,
      height: '100%',
      background: 'var(--bg-base)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Panel header */}
      <div style={{
        padding: '1rem 2rem 0.75rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span className="ui-label ui-label-gold">
          {view === 'idle' ? 'Your letter' : view === 'loading' ? 'Composing...' : view === 'ab' ? 'A / B comparison' : 'Draft ready'}
        </span>
        {(view === 'result' || view === 'ab') && (
          <button onClick={onReset} className="btn-ghost" style={{ padding: '0.3rem 0.7rem' }}>New letter</button>
        )}
        {view === 'loading' && (
          <button onClick={onCancel} className="btn-ghost" style={{ padding: '0.3rem 0.7rem' }}>Cancel</button>
        )}
      </div>

      {/* Content area */}
      <div className="scrollable" style={{ flex: 1, overflow: 'hidden auto' }}>
        {view === 'idle' && <IdleState />}
        {view === 'loading' && <LoadingState streamingText={streamingText} statusMessage={statusMessage} />}
        {view === 'result' && result && (
          <div style={{ padding: '1.5rem 2rem', height: '100%' }}>
            <OutputPanel result={result} onReset={onReset} onSave={onSave} />
          </div>
        )}
        {view === 'ab' && abResult && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <ABComparisonPanel result={abResult} onReset={onReset} onSave={onSave} />
          </div>
        )}
      </div>
    </div>
  );
}
