import React, { useState } from 'react';

const MAX_REFINEMENTS = 3;
const CHIPS = ['Too formal','Too casual','Too long','Too short','More warmth','More specific','Remove clichés','More personal'];

export default function FeedbackPanel({ draftId, currentDraft, formInput, onRefined }) {
  const [rating, setRating] = useState(null);
  const [critique, setCritique] = useState('');
  const [refining, setRefining] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const submitRating = async (score) => {
    setRating(score);
    if (draftId) {
      try { await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, score }) }); } catch {}
    }
    if (score === 1) setDone(true);
  };

  const refine = async () => {
    if (!critique.trim() || refining || count >= MAX_REFINEMENTS) return;
    setRefining(true); setError(null);
    try {
      const res = await fetch('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, currentDraft, critique: critique.trim(), formInput }) });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Refinement failed.'); return; }
      const newCount = count + 1;
      setCount(newCount); setCritique(''); setRating(null); onRefined(data.refinedDraft);
      if (newCount >= MAX_REFINEMENTS) setDone(true);
    } catch { setError('Cannot reach backend.'); }
    finally { setRefining(false); }
  };

  const labelStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' };

  if (done) return (
    <div style={{ borderTop: '1px solid var(--ink-border)', marginTop: '1.5rem', paddingTop: '1.25rem', textAlign: 'center' }}>
      <span style={{ ...labelStyle, color: rating === 1 ? 'var(--success)' : 'var(--parch-ghost)', opacity: 0.7 }}>
        {rating === 1 ? '✓ Noted — thank you' : `Maximum revisions reached (${MAX_REFINEMENTS})`}
      </span>
    </div>
  );

  return (
    <div style={{ borderTop: '1px solid var(--ink-border)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
      {rating === null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ ...labelStyle, color: 'var(--parch-ghost)' }}>Does this feel right?</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['👍', 1], ['👎', -1]].map(([emoji, score]) => (
              <button key={score} onClick={() => submitRating(score)} className="ghost-btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}>
                {emoji}
              </button>
            ))}
          </div>
          {count > 0 && <span style={{ ...labelStyle, marginLeft: 'auto', opacity: 0.4 }}>{count}/{MAX_REFINEMENTS}</span>}
        </div>
      )}

      {rating === -1 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...labelStyle, color: 'var(--parch-ghost)' }}>What needs to change?</span>
            <span style={{ ...labelStyle, opacity: 0.4 }}>{count}/{MAX_REFINEMENTS} used</span>
          </div>
          {/* Quick chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {CHIPS.map(c => (
              <button key={c} type="button" onClick={() => setCritique(p => p ? `${p}. ${c}` : c)}
                style={{ ...labelStyle, background: 'none', border: '1px solid var(--ink-border)', borderRadius: '2px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--parch-ghost)', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--ink-border)'; e.target.style.color = 'var(--parch-ghost)'; }}>
                {c}
              </button>
            ))}
          </div>
          <textarea value={critique} onChange={e => setCritique(e.target.value)}
            placeholder="Describe exactly what to fix..." rows={3} maxLength={500}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--ink-border)', borderRadius: '2px', padding: '0.85rem 1rem', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--parch)', outline: 'none', resize: 'none' }} />
          {error && <p style={{ ...labelStyle, color: 'var(--error)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setRating(null); setCritique(''); setError(null); }} className="ghost-btn">Cancel</button>
            <button onClick={refine} disabled={critique.trim().length < 3 || refining} className="seal-btn" style={{ flex: 1, padding: '0.85rem' }}>
              {refining ? 'Refining...' : 'Refine this draft →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
