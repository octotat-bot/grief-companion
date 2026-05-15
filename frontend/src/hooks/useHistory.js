// Saves generated drafts to the MongoDB backend

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../config';

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addToHistory = async (entry) => {
    if (!token) return;
    const payload = {
      situation: entry.metadata.situation,
      relationship: entry.metadata.relationship,
      tone: entry.metadata.tone,
      context: entry.metadata.context || 'Context not provided',
      recipientName: entry.metadata.recipientName,
      senderName: entry.metadata.senderName,
      draftText: entry.draft
    };

    try {
      const res = await fetch(`${API}/api/history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  const removeFromHistory = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API}/api/history/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete from history:', err);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory, loading };
}
