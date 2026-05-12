import { useState, useEffect } from 'react';

export function useServiceHealth() {
  const [status, setStatus] = useState({
    backend: 'unknown',
    mongodb: 'unknown',
    ollama: 'unknown',
    rag: 'unknown'
  });

  useEffect(() => {
    let mounted = true;
    
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (!mounted) return;
        
        if (res.ok || res.status === 206) {
          const data = await res.json();
          setStatus({
            backend: data.backend || 'ok',
            mongodb: data.mongodb || 'unknown',
            ollama: data.ollama || 'unknown',
            rag: data.rag || 'unknown'
          });
        } else {
          setStatus({ backend: 'down', mongodb: 'down', ollama: 'down', rag: 'down' });
        }
      } catch (err) {
        if (mounted) {
          setStatus({ backend: 'down', mongodb: 'down', ollama: 'down', rag: 'down' });
        }
      }
    };

    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
