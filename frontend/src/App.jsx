import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import API from './config';
import Topbar from './components/Topbar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Statusbar from './components/Statusbar';
import HistoryDrawer from './components/HistoryDrawer';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { useGenerate } from './hooks/useGenerate';
import { useGenerateAB } from './hooks/useGenerateAB';

function MainApp() {
  const { generate, loading, error, result, streamingText, statusMessage, cancel, reset } = useGenerate();
  const { generateAB, loading: abLoading, error: abError, result: abResult, reset: abReset } = useGenerateAB();
  const [view, setView] = useState('idle'); // idle | loading | result | ab
  const [sessionValues, setSessionValues] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const isLoading = loading || abLoading;
  const activeError = error || abError;

  useEffect(() => {
    fetch(`${API}/api/session`).then(r => r.json())
      .then(d => { if (d.success && d.formState) setSessionValues(d.formState); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (fd) => {
    setView('loading');
    await generate(fd);
    setView('result');
  };

  const handleCompare = async (fd) => {
    setView('loading');
    await generateAB(fd);
    setView('ab');
  };

  const handleReset = () => {
    reset(); abReset(); setView('idle');
  };

  const handleSave = async (draftId, editedDraft, note) => {
    if (!draftId) return;
    await fetch(`${API}/api/history/${draftId}/save`, { method: 'PATCH' });
    if (note) await fetch(`${API}/api/history/${draftId}/note`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });
    if (editedDraft) await fetch(`${API}/api/history/${draftId}/edit`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editedDraft })
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Topbar onHistoryOpen={() => setHistoryOpen(true)} />

      {/* Two-panel body */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        marginTop: 'var(--topbar-h)',
        marginBottom: 'var(--statusbar-h)'
      }}>
        {/* LEFT — Form panel */}
        <LeftPanel
          onSubmit={handleSubmit}
          onCompare={handleCompare}
          loading={isLoading}
          initialValues={sessionValues}
          error={activeError}
        />

        {/* Gold vertical divider */}
        <div style={{ width: '1px', background: 'var(--divider)', flexShrink: 0 }} />

        {/* RIGHT — Output panel */}
        <RightPanel
          view={view}
          result={result}
          abResult={abResult}
          streamingText={streamingText}
          statusMessage={statusMessage}
          onReset={handleReset}
          onSave={handleSave}
          onCancel={() => { cancel(); setView('idle'); }}
        />
      </div>

      <Statusbar />

      {/* History drawer (slides in from right) */}
      {historyOpen && <HistoryDrawer onClose={() => setHistoryOpen(false)} />}
    </div>
  );
}

import GlobalLoader from './components/GlobalLoader';

import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <GlobalLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return children;
}

export default function App() {
  return (
    <>
      <GlobalLoader />
      <Routes>
      <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
    </>
  );
}
