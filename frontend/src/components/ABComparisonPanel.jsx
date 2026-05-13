import React, { useState } from 'react';

const TONE_LABELS = {
  formal: 'Formal',
  warm: 'Warm',
  brief: 'Brief',
  heartfelt: 'Heartfelt'
};

const TONE_HINTS = {
  formal: 'Professional, respectful distance',
  warm: 'Natural, caring language',
  brief: '2–4 sentences, no filler',
  heartfelt: 'Deep, emotionally open'
};

function DraftCard({ variant, label, onSave, metadata }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(variant.draft);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    // Wait for history hook
    await onSave({
      draft: text,
      metadata: { ...metadata, tone: variant.tone }
    });
    setSaved(true);
  };

  if (variant.failed || !variant.draft) {
    return (
      <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="ui-label" style={{ textAlign: 'center' }}>Generation failed for this variant. Try again.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <span className="ui-label ui-label-gold" style={{ display: 'block', marginBottom: '0.25rem' }}>{label}</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {TONE_LABELS[variant.tone]} Tone
          </h3>
          <p className="ui-label" style={{ opacity: 0.7 }}>{TONE_HINTS[variant.tone]}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={editing ? () => setEditing(false) : () => setEditing(true)}
            className="btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
            {editing ? 'Done' : 'Edit'}
          </button>
          <button onClick={copy}
            className="btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Draft text */}
      <div style={{ flex: 1, borderRadius: '2px', padding: '1rem', background: editing ? 'var(--bg-hover)' : 'rgba(255,255,255,0.02)', border: editing ? '1px solid var(--gold)' : '1px solid transparent' }}>
        {editing ? (
          <textarea value={text} onChange={e => setText(e.target.value)} rows={7}
            autoFocus style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.95rem', lineHeight: '1.6', resize: 'none' }} />
        ) : (
          <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{text}</p>
        )}
      </div>

      {/* Save */}
      {!saved ? (
        <button onClick={handleSave} className="btn-primary">
          Save this version
        </button>
      ) : (
        <div style={{ padding: '0.8rem', border: '1px solid var(--success)', background: 'rgba(90,170,120,0.1)', borderRadius: '2px', textAlign: 'center' }}>
          <span className="ui-label" style={{ color: 'var(--success)' }}>✓ Saved to History</span>
        </div>
      )}
    </div>
  );
}

export default function ABComparisonPanel({ result, onReset, onSave }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', pb: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          Tone Comparison
        </h2>
        <span className="ui-label ui-label-gold">
          Generated in parallel
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <DraftCard
          variant={result.variantA}
          label="Version A"
          metadata={result.metadata}
          onSave={onSave}
        />
        <DraftCard
          variant={result.variantB}
          label="Version B"
          metadata={result.metadata}
          onSave={onSave}
        />
      </div>

      {result.ragDegraded && (
        <p className="ui-label" style={{ color: 'var(--gold)', background: 'var(--gold-subtle)', padding: '0.75rem 1rem', border: '1px solid var(--gold-line)', borderRadius: '2px' }}>
          Generated without corpus examples (RAG service was down).
        </p>
      )}

      <button onClick={onReset} className="btn-ghost" style={{ width: '100%', padding: '1rem' }}>
        Generate New Drafts
      </button>
    </div>
  );
}
