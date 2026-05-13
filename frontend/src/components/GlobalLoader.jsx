import React, { useState, useEffect } from 'react';

export default function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fading out after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1800);

    // Completely unmount after 2.5 seconds
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-base)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.7s ease-in-out',
      pointerEvents: fading ? 'none' : 'auto'
    }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', inset: 0, 
          background: 'var(--gold)', opacity: 0.15, 
          filter: 'blur(30px)', borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        <img src="/favicon.svg" alt="Loading" style={{
          width: '70px', height: '70px', 
          animation: 'float 4s ease-in-out infinite'
        }} />
      </div>
      
      <span style={{ 
        fontFamily: 'var(--font-display)', fontSize: '1.2rem', 
        color: 'var(--text-secondary)', letterSpacing: '0.2em',
        textTransform: 'uppercase', marginTop: '2rem',
        animation: 'fadeUp 1.5s ease-out forwards',
        opacity: 0, transform: 'translateY(10px)'
      }}>
        Grief Companion
      </span>

      <style>{`
        @keyframes fadeUp {
          to { opacity: 0.8; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
