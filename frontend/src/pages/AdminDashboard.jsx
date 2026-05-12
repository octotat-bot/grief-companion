// /admin route — analytics dashboard
// Private Letter UI Redesignimport React, { useState, useEffect } from 'react';
import Statusbar from '../components/Statusbar';

const COLORS = {
  condolence: 'var(--gold)',
  apology: 'var(--text-secondary)',
  difficult_news: 'var(--text-tertiary)',
  reconnection: 'rgba(200, 168, 75, 0.6)',
  eulogy: 'var(--text-primary)',
  formal: 'var(--text-tertiary)',
  warm: 'var(--gold)',
  brief: 'var(--text-secondary)',
  heartfelt: 'rgba(200, 168, 75, 0.8)',
  colleague: 'var(--text-secondary)',
  friend: 'var(--gold)',
  close_friend: 'rgba(200, 168, 75, 0.8)',
  family: 'var(--text-primary)',
  acquaintance: 'var(--text-tertiary)',
  partner: 'var(--gold)'
};

// Stat card component
function StatCard({ label, value, sub, color = 'var(--gold)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '2px',
      padding: '0.85rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <span className="ui-label" style={{ marginBottom: '0.25rem' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', lineHeight: '1', color }}>{value}</span>
      {sub && <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{sub}</span>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(30);

  const fetchAnalytics = async (days) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      const json = await res.json();
      if (!json.success) { setError(json.message || 'Failed to load analytics'); return; }
      setData(json);
    } catch (err) { setError('Cannot reach backend. Is it running?'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(range); }, [range]);

  if (loading) return (
    <div style={{ height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          border: '1.5px solid var(--gold)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span className="ui-label">Gathering records...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ height: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--error)', padding: '2.5rem', borderRadius: '2px', textAlign: 'center', maxWidth: '300px' }}>
        <span className="ui-label" style={{ color: 'var(--error)', display: 'block', marginBottom: '1rem' }}>Archive Error</span>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => fetchAnalytics(range)} className="btn-ghost" style={{ width: '100%' }}>Retry</button>
      </div>
    </div>
  );

  const { summary, charts, recentDrafts } = data;

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)'
    }}>
      {/* Admin topbar */}
      <div style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', flexShrink: 0
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          Analytics <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Dashboard</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={range === d ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '0.35rem 0.75rem' }}>
              {d}d
            </button>
          ))}
          <a href="/" className="btn-ghost" style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', display: 'inline-flex' }}>
            ← App
          </a>
        </div>
      </div>

      {/* Scrollable content — ONLY this div scrolls, not the page */}
      <div className="scrollable" style={{ flex: 1, overflow: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Stats Grid */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
            <StatCard label="Total Composed" value={summary.totalGenerations.toLocaleString()} sub="In period" />
            <StatCard label="Preserved" value={summary.totalSaved.toLocaleString()} sub={`${summary.saveRate}% save rate`} color="var(--text-primary)" />
            <StatCard label="Degraded" value={`${summary.ragDegradedRate}%`} sub="Corpus unavailable" color={summary.ragDegradedRate > 20 ? 'var(--error)' : 'var(--text-secondary)'} />
            <StatCard label="Satisfaction" value={data.feedback.totalRated > 0 ? `${data.feedback.positiveRate}%` : '—'} sub={`${data.feedback.totalRated} rated drafts`} color="var(--text-primary)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Timeline */}
            <div className="fade-up delay-1" style={{ borderLeft: '1px solid var(--divider)', paddingLeft: '1.5rem' }}>
              <span className="ui-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Timeline</span>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Daily composed vs preserved</p>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                {charts.generationsOverTime.map((pt, i) => {
                  const max = Math.max(...charts.generationsOverTime.map(d => Math.max(d.count, 1)));
                  const h = (pt.count / max) * 100;
                  const hs = (pt.saved / Math.max(pt.count, 1)) * 100;
                  return (
                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}%`, background: 'var(--gold-subtle)', borderTop: '1px solid var(--gold-line)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${hs}%`, background: 'var(--gold)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Themes */}
            <div className="fade-up delay-2" style={{ borderLeft: '1px solid var(--divider)', paddingLeft: '1.5rem' }}>
              <span className="ui-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Themes</span>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Distribution of situations</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {charts.situationDist.map((entry, i) => {
                  const max = Math.max(...charts.situationDist.map(d => Math.max(d.count, 1)));
                  const w = (entry.count / max) * 100;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="ui-label" style={{ width: '100px', textAlign: 'right', color: 'var(--text-secondary)' }}>{entry.situation.replace('_', ' ')}</span>
                      <div style={{ flex: 1, height: '2px', background: 'var(--bg-card)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${w}%`, background: COLORS[entry.situation] || 'var(--gold)' }} />
                      </div>
                      <span className="ui-label" style={{ width: '30px' }}>{entry.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Feed */}
          <div className="fade-up delay-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '1.5rem' }}>
            <span className="ui-label" style={{ display: 'block', marginBottom: '1.5rem' }}>Recent Feed</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentDrafts.map((d, i) => (
                <div key={i} style={{ paddingBottom: '1.5rem', borderBottom: i === recentDrafts.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span className="ui-label ui-label-gold">{d.situation?.replace('_', ' ')}</span>
                      <span className="ui-label" style={{ opacity: 0.4 }}>{d.relationship} · {d.tone}</span>
                    </div>
                    <span className="ui-label" style={{ opacity: 0.4 }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{d.preview}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Statusbar />
    </div>
  );
}

  );
}
