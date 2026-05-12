import React, { useEffect, useState } from 'react';

const PHRASES = [
  'Reading the situation carefully...',
  'Searching the archive of letters...',
  'Choosing the right words...',
  'Shaping the tone...',
  'Almost there...',
];

export default function LoadingState({ streamingText, statusMessage }) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (streamingText) return;
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 2800);
    return () => clearInterval(t);
  }, [streamingText]);

  const display = statusMessage || PHRASES[phraseIdx];

  return (
    <div className="fade-in">
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          border: '1.5px solid var(--gold)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite', flexShrink: 0
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--parch-ghost)' }}>
          {display}
        </span>
      </div>

      {/* Streaming text or skeleton */}
      <div className="letter-paper" style={{ minHeight: '9rem' }}>
        {streamingText ? (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', lineHeight: '1.9', color: '#1a1612', whiteSpace: 'pre-wrap' }}>
            {streamingText}
            <span className="cursor-blink" />
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[92, 78, 86, 65, 80].map((w, i) => (
              <div key={i} style={{
                height: '1rem', borderRadius: '1px',
                background: 'rgba(26,22,18,0.12)',
                width: `${w}%`,
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 150}ms`
              }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.7; } }
      `}</style>
    </div>
  );
}
