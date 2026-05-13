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
    <div className="fade-in" style={{
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: streamingText ? 'flex-start' : 'center',
      minHeight: '400px',
      position: 'relative',
      background: streamingText ? 'var(--bg-card)' : 'transparent',
      borderRadius: '2px',
      border: streamingText ? '1px solid var(--border)' : 'none',
      padding: '2rem'
    }}>
      {!streamingText ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', margin: 'auto' }}>
          {/* Aesthetic Glowing Motif */}
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: 0, 
              background: 'var(--gold)', opacity: 0.15, 
              filter: 'blur(25px)', borderRadius: '50%',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
            <img src="/favicon.svg" alt="Loading" style={{
              width: '50px', height: '50px', 
              animation: 'float 4s ease-in-out infinite'
            }} />
          </div>

          {/* Typewriter text for phrases */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', 
              letterSpacing: '0.15em', textTransform: 'uppercase', 
              color: 'var(--gold)', opacity: 0.8,
              display: 'block', marginBottom: '0.8rem'
            }}>
              Drafting
            </span>
            <span className="fade-in" key={phraseIdx} style={{ 
              fontFamily: 'var(--font-display)', fontSize: '1.25rem', 
              color: 'var(--text-secondary)', fontStyle: 'italic',
              fontWeight: 300
            }}>
              {display}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '150px', height: '1px', background: 'var(--divider)', position: 'relative', overflow: 'hidden', marginTop: '1rem' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
              background: 'var(--gold)',
              animation: 'slide 2s ease-in-out infinite'
            }} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {streamingText}
            <span className="cursor-blink" style={{ display: 'inline-block', width: '8px', height: '1.15rem', background: 'var(--gold)', marginLeft: '4px', verticalAlign: 'text-bottom' }} />
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity:0.15; } 50% { transform: scale(1.3); opacity:0.25; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
      `}</style>
    </div>
  );
}
