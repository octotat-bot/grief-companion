// Fixed 36px bottom bar — service status dots only. Minimal.

import React from 'react';
import { useServiceHealth } from '../hooks/useServiceHealth';

export default function Statusbar() {
  const status = useServiceHealth();
  const services = [
    { label: 'Backend', key: 'backend' },
    { label: 'MongoDB', key: 'mongodb' },
    { label: 'Ollama', key: 'ollama' },
    { label: 'RAG', key: 'rag' },
  ];

  const dotColor = (s) => ({ ok: '#3d7a52', down: '#8b4040', unknown: 'var(--text-tertiary)' }[s] || 'var(--text-tertiary)');

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--statusbar-h)',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--divider)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', gap: '1.25rem',
      zIndex: 100
    }}>
      {services.map(s => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dotColor(status[s.key]) }} />
          <span className="ui-label" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
