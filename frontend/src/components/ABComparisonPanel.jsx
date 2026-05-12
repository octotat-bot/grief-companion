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
      <div className="flex-1 bg-deep/50 border border-white/5 rounded-3xl p-6 md:p-8 flex items-center justify-center">
        <p className="text-sm text-muted text-center font-medium">Generation failed for this variant. Try again.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-deep/60 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-inner relative group transition-colors hover:border-accent/30">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded border border-accent/20 mb-2 inline-block">{label}</span>
          <h3 className="text-lg font-serif text-warm flex items-center gap-2">
            {TONE_LABELS[variant.tone]} Tone
          </h3>
          <p className="text-xs text-muted/80">{TONE_HINTS[variant.tone]}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={editing ? () => setEditing(false) : () => setEditing(true)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
              editing 
                ? 'bg-accent text-white border-accent shadow-md shadow-accent/20' 
                : 'bg-surface/50 border-white/10 text-muted hover:text-warm hover:border-accent/30 hover:bg-surface'
            }`}>
            {editing ? 'Done' : 'Edit'}
          </button>
          <button onClick={copy}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-surface/50 border-white/10 text-muted hover:text-warm hover:border-accent/30 hover:bg-surface'
            }`}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Draft text */}
      <div className={`flex-1 rounded-2xl p-4 transition-all ${editing ? 'bg-deep shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-accent/30' : 'bg-surface/30'}`}>
        {editing ? (
          <textarea value={text} onChange={e => setText(e.target.value)} rows={7}
            autoFocus className="w-full bg-transparent text-warm font-serif text-[15px] leading-relaxed resize-none focus:outline-none" />
        ) : (
          <p className="text-warm font-serif text-[15px] leading-relaxed whitespace-pre-wrap">{text}</p>
        )}
      </div>

      {/* Save */}
      {!saved ? (
        <button onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/30 hover:from-accent/20 hover:to-purple-500/20 text-accent hover:border-accent/50 rounded-xl text-sm font-semibold transition-all">
          Save this version
        </button>
      ) : (
        <div className="w-full py-3 text-center text-sm font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          ✓ Saved to History
        </div>
      )}
    </div>
  );
}

export default function ABComparisonPanel({ result, onReset, onSave }) {
  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <h2 className="text-xl font-serif text-warm flex items-center gap-3">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Tone Comparison
        </h2>
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
          Generated in parallel
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
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
        <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          Generated without corpus examples (RAG service was down).
        </p>
      )}

      <button onClick={onReset}
        className="w-full py-4 bg-surface/50 border border-white/10 hover:bg-surface hover:border-white/20 text-warm rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg mt-4">
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Generate New Drafts
      </button>
    </div>
  );
}
