import { useState } from 'react';

export function useGenerateAB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generateAB = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate/ab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error === 'OLLAMA_NOT_RUNNING'
          ? 'Ollama is not running. Run: ollama serve'
          : data.errors?.join('. ') || data.message || 'Generation failed.';
        setError({ type: data.error === 'OLLAMA_NOT_RUNNING' ? 'setup' : 'general', message: msg });
        return;
      }
      setResult(data);
    } catch {
      setError({ type: 'setup', message: 'Cannot reach backend on port 3001.' });
    } finally {
      setLoading(false);
    }
  };

  return { generateAB, loading, error, result, reset: () => { setResult(null); setError(null); } };
}
