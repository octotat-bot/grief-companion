import React, { useState } from 'react';
import SourceSnippets from './SourceSnippets';
import FeedbackPanel from './FeedbackPanel';

export default function OutputPanel({ result, onReset, onSave }) {
  const [currentDraft, setCurrentDraft] = useState(result.draft);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState([]);

  const copy = async () => {
    await navigator.clipboard.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await onSave(result.draftId, currentDraft, note);
    setSaved(true);
  };

  const handleDoneEditing = async () => {
    setEditing(false);
    if (result.draftId && currentDraft !== result.draft) {
      try {
        await fetch(`/api/history/${result.draftId}/edit`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ editedDraft: currentDraft }) });
      } catch {}
    }
  };

  const handleRefined = (refined) => {
    setRefinementHistory(prev => [...prev, currentDraft]);
    setCurrentDraft(refined);
    setEditing(false);
  };

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--parch-ghost)',
  };

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <span style={{ ...labelStyle, color: 'var(--gold)', display: 'block', marginBottom: '0.25rem' }}>Draft composed</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.5rem', color: 'var(--parch)' }}>Your Letter</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={editing ? handleDoneEditing : () => setEditing(true)} className="btn-ghost" style={{ padding: '0.5rem 0.85rem' }}>
            {editing ? 'Done' : 'Edit'}
          </button>
          <button onClick={copy} className="btn-ghost" style={{ padding: '0.5rem 0.85rem' }}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Letter paper */}
      <div className="letter-paper" style={{ marginBottom: '1.5rem' }}>
        {editing ? (
          <textarea value={currentDraft} onChange={e => setCurrentDraft(e.target.value)}
            autoFocus rows={10}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: '1.1rem', lineHeight: '1.9', color: '#1a1612', resize: 'none' }} />
        ) : (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', lineHeight: '1.9', color: '#1a1612', whiteSpace: 'pre-wrap' }}>
            {currentDraft}
          </p>
        )}
      </div>

      {/* Metadata tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[result.metadata?.situation, result.metadata?.relationship, result.metadata?.tone].filter(Boolean).map(tag => (
          <span key={tag} style={{ ...labelStyle, padding: '0.3rem 0.6rem', border: '1px solid var(--ink-border)', opacity: 0.7 }}>
            {tag.replace('_', ' ')}
          </span>
        ))}
        {result.ragDegraded && (
          <span style={{ ...labelStyle, padding: '0.3rem 0.6rem', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', opacity: 0.7 }}>
            No corpus examples
          </span>
        )}
        {!result.dbSaved && (
          <span style={{ ...labelStyle, padding: '0.3rem 0.6rem', border: '1px solid rgba(139,58,58,0.4)', color: 'var(--error)', opacity: 0.8 }}>
            Not persisted
          </span>
        )}
      </div>

      <SourceSnippets examples={result.retrievedExamples} />

      {/* Refinement history */}
      {refinementHistory.length > 0 && (
        <div style={{ marginTop: '1rem', border: '1px solid var(--ink-border)', borderRadius: '2px' }}>
          <button onClick={() => setShowHistory(v => !v)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="type-label">Revision history ({refinementHistory.length})</span>
            <span style={{ color: 'var(--parch-ghost)', fontSize: '0.75rem' }}>{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && refinementHistory.map((prev, i) => (
            <div key={i} style={{ padding: '1rem', borderTop: '1px solid var(--ink-border)', background: 'var(--ink-soft)' }}>
              <span className="type-label" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.5 }}>Version {i + 1}</span>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--parch-ghost)', lineHeight: '1.7' }}>"{prev.slice(0, 120)}..."</p>
              <button onClick={() => { setRefinementHistory(h => h.slice(0, i)); setCurrentDraft(prev); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '0.5rem' }}>
                Restore →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      <FeedbackPanel draftId={result.draftId} currentDraft={currentDraft} formInput={result.metadata} onRefined={handleRefined} />

      {/* Note field */}
      {showNote && (
        <div className="fade-in" style={{ marginTop: '1.25rem' }}>
          <span className="type-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Label this draft</span>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder='e.g. "For Priya — condolence"' maxLength={100}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--ink-border)', borderRadius: '2px', padding: '0.75rem 1rem', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--parch)', outline: 'none' }} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        {!saved ? (
          <>
            <button onClick={() => setShowNote(v => !v)} className="btn-ghost" style={{ flexShrink: 0 }}>
              {showNote ? '−' : '+'} Label
            </button>
            <button onClick={handleSave} disabled={!result.draftId} className="btn-primary" style={{ flex: 1, padding: '0.85rem' }}>
              {result.draftId ? 'Save Draft' : 'Save unavailable'}
            </button>
          </>
        ) : (
          <div style={{ flex: 1, padding: '0.85rem', border: '1px solid rgba(58,107,74,0.4)', background: 'rgba(58,107,74,0.07)', borderRadius: '2px', textAlign: 'center' }}>
            <span className="type-label" style={{ color: 'var(--success)' }}>✓ Draft saved</span>
          </div>
        )}
        <button onClick={onReset} className="btn-ghost">New letter</button>
      </div>
    </div>
  );
}
