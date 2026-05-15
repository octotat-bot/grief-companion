// Left panel — contains the entire input form.
// Fixed width, never scrolls the page. Form internally scrolls if needed.
// All form sections are compacted so they fit on screen without scrolling.

import React, { useState, useEffect, useRef } from 'react';
import API from '../config';

const SITUATIONS = [
  { value: 'condolence',     label: 'Condolence',    sub: 'loss · grief' },
  { value: 'apology',        label: 'Apology',        sub: 'remorse · repair' },
  { value: 'difficult_news', label: 'Difficult news', sub: 'compassion · truth' },
  { value: 'reconnection',   label: 'Reconnection',   sub: 'distance · return' },
  { value: 'eulogy',         label: 'Tribute',        sub: 'honour · love' },
];

const RELATIONSHIPS = [
  { value: 'colleague',    label: 'Colleague' },
  { value: 'friend',       label: 'Friend' },
  { value: 'close_friend', label: 'Close friend' },
  { value: 'family',       label: 'Family' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'partner',      label: 'Partner' },
];

const TONES = [
  { value: 'formal',    label: 'Formal' },
  { value: 'warm',      label: 'Warm' },
  { value: 'brief',     label: 'Brief' },
  { value: 'heartfelt', label: 'Heartfelt' },
];

export default function LeftPanel({ onSubmit, onCompare, loading, initialValues, error }) {
  const [form, setForm] = useState({
    situation: '', relationship: '', tone: 'warm',
    context: '', recipientName: '', senderName: '', additionalNotes: '',
    ...initialValues
  });
  const [classifierResult, setClassifierResult] = useState(null);
  const timerRef = useRef(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-save session
  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`${API}/api/session`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formState: form })
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(t);
  }, [form]);

  // Auto-classify
  useEffect(() => {
    if (form.context.trim().length < 15) { setClassifierResult(null); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/classify`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: form.context })
        });
        const data = await res.json();
        if (data.success && data.available && data.label) {
          setClassifierResult(data);
          if (data.confidence >= 0.80 && !form.situation) set('situation', data.label);
        }
      } catch {}
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [form.context]);

  const isValid = form.situation && form.relationship && form.context.trim().length >= 10;

  const sectionLabel = (text) => (
    <span style={{
      fontFamily: 'var(--font-ui)',
      fontSize: '0.62rem',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',  // brighter than text-tertiary
      display: 'block',
      marginBottom: '0.5rem'
    }}>
      {text}
    </span>
  );

  return (
    <div style={{
      width: '38vw', minWidth: '320px', maxWidth: '460px',
      flexShrink: 0,
      height: '100%',
      background: 'var(--bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Panel header */}
      <div style={{
        padding: '1rem 1.5rem 0.75rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <span className="ui-label ui-label-gold">Compose a letter</span>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          margin: '0.75rem 1.5rem 0',
          padding: '0.6rem 0.85rem',
          background: 'rgba(139,64,64,0.12)',
          border: '1px solid rgba(139,64,64,0.35)',
          borderRadius: '2px', flexShrink: 0
        }}>
          <span className="ui-label" style={{ color: 'var(--error)' }}>{error.message}</span>
        </div>
      )}

      {/* Form — this is the only element that may internally scroll */}
      <div className="scrollable" style={{ flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* I — Situation */}
        <div className="gold-bar fade-up">
          {sectionLabel('I · Situation')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {SITUATIONS.map(s => (
              <button key={s.value} type="button"
                onClick={() => set('situation', s.value)}
                className={`sel-pill ${form.situation === s.value ? 'active' : ''}`}>
                <span style={{ display: 'block' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, opacity: 0.55, lineHeight: 1 }}>{s.sub}</span>
              </button>
            ))}
          </div>
          {/* AI detector badge */}
          {classifierResult?.available && (
            <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span className="ui-label" style={{ opacity: 0.5 }}>AI detected →</span>
              <button type="button" onClick={() => set('situation', classifierResult.label)}
                className={`sel-pill ${form.situation === classifierResult.label ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.55rem' }}>
                {classifierResult.label.replace('_', ' ')} · {Math.round(classifierResult.confidence * 100)}%
              </button>
            </div>
          )}
        </div>

        {/* II — Relationship */}
        <div className="gold-bar fade-up delay-1">
          {sectionLabel('II · Relationship')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
            {RELATIONSHIPS.map(r => (
              <button key={r.value} type="button"
                onClick={() => set('relationship', r.value)}
                className={`sel-pill ${form.relationship === r.value ? 'active' : ''}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* III — Tone */}
        <div className="gold-bar fade-up delay-2">
          {sectionLabel('III · Tone')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
            {TONES.map(t => (
              <button key={t.value} type="button"
                onClick={() => set('tone', t.value)}
                className={`sel-pill ${form.tone === t.value ? 'active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* IV — Context */}
        <div className="gold-bar fade-up delay-3">
          {sectionLabel('IV · Describe what happened')}
          <textarea
            className="field"
            value={form.context}
            onChange={e => set('context', e.target.value)}
            placeholder="Write freely — the more honest, the more the words will feel like yours..."
            rows={4}
            maxLength={1000}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            {form.context.length > 800 && (
              <span className="ui-label" style={{ color: 'var(--gold)', opacity: 0.7 }}>{form.context.length}/1000</span>
            )}
          </div>
        </div>

        {/* V — Names (inline, compact) */}
        <div className="gold-bar fade-up delay-4">
          {sectionLabel('V · Names (optional)')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input type="text" className="field" value={form.recipientName}
              onChange={e => set('recipientName', e.target.value)}
              placeholder="Their name" style={{ padding: '0.5rem 0.7rem' }} />
            <input type="text" className="field" value={form.senderName}
              onChange={e => set('senderName', e.target.value)}
              placeholder="Your name" style={{ padding: '0.5rem 0.7rem' }} />
          </div>
        </div>

      </div>

      {/* Bottom action bar — always visible, never pushed off screen */}
      <div style={{
        padding: '0.85rem 1.5rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '0.5rem',
        flexShrink: 0,
        background: 'var(--bg-surface)'
      }}>
        <button
          onClick={() => isValid && !loading && onSubmit(form)}
          disabled={!isValid || loading}
          className="btn-primary"
          style={{ flex: 1 }}>
          {loading ? 'Composing...' : 'Compose letter'}
        </button>
        <button
          onClick={() => isValid && !loading && onCompare && onCompare(form)}
          disabled={!isValid || loading}
          className="btn-ghost"
          title="Generate two tone variants side by side">
          A / B
        </button>
      </div>
    </div>
  );
}
