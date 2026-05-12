// Auth page — same premium aesthetic, login + signup in one view
// Toggle between "Sign in" and "Create account" modes.
// Wire up to your existing auth backend (replace fetch URLs as needed).

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'signin'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Authentication failed. Please try again.');
        return;
      }

      if (data.token) {
        login(data.user, data.token);
      }
      setSuccess(true);
      setTimeout(() => window.location.href = '/', 800);
    } catch {
      setError('Cannot reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="fade-up" style={{ textAlign: 'center' }}>
        <span className="ui-label ui-label-gold" style={{ marginBottom: '1rem', display: 'block' }}>Welcome</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem', color: 'var(--text-primary)' }}>
          You're in.
        </h2>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Redirecting...
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Wordmark */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="ui-label" style={{ marginBottom: '0.75rem', display: 'block', opacity: 0.5 }}>A writing instrument</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.85rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Grief Language <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Companion</span>
          </h1>
          {/* Gold ornament line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, var(--gold))' }} />
            <div style={{ width: '5px', height: '5px', background: 'var(--gold)', transform: 'rotate(45deg)', opacity: 0.7 }} />
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, var(--gold))' }} />
          </div>
        </div>

        {/* Card */}
        <div className="fade-up delay-1" style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          padding: '2.5rem',
        }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            {[['signin', 'Sign in'], ['signup', 'Create account']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, padding: '0.75rem', background: mode === m ? 'var(--bg-card)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'var(--font-ui)', fontSize: '0.58rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: mode === m ? 'var(--gold)' : 'var(--text-tertiary)',
                  borderRight: m === 'signin' ? '1px solid var(--border)' : 'none'
                }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="fade-in">
                <span className="ui-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Full name</span>
                <input type="text" className="field" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your name" required />
              </div>
            )}

            {/* Email */}
            <div>
              <span className="ui-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Email address</span>
              <input type="email" className="field" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>

            {/* Password */}
            <div>
              <span className="ui-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Password</span>
              <input type="password" className="field" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="··········" required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--error)', background: 'rgba(139,64,64,0.1)', borderRadius: '2px' }}>
                <span className="ui-label" style={{ color: 'var(--error)' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="fade-up delay-2" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span className="ui-label" style={{ opacity: 0.35 }}>
            Private · Local · Secure
          </span>
        </div>
      </div>
    </div>
  );
}
  );
}
