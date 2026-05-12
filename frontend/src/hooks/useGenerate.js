import { useState, useRef } from 'react';

export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const abortRef = useRef(null);

  const generate = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingText('');
    setStatusMessage('Connecting...');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      if (!response.ok) {
        const data = await response.json();
        setError({ type: 'validation', message: data.errors?.join('. ') || 'Invalid input' });
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let finalResult = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const event of events) {
          const dataLine = event.split('\n').find(line => line.startsWith('data: '));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === 'status') {
              setStatusMessage(parsed.message);
            }

            if (parsed.type === 'token') {
              accumulatedText += parsed.token;
              const displayText = cleanStreamingText(accumulatedText);
              setStreamingText(displayText);
            }

            if (parsed.type === 'saved') {
              finalResult = { ...finalResult, draftId: parsed.draftId };
            }

            if (parsed.type === 'done') {
              finalResult = {
                ...finalResult,
                draft: parsed.draft,
                retrievedExamples: parsed.retrievedExamples || [],
                ragDegraded: parsed.ragDegraded || false,
                dbSaved: !!finalResult?.draftId,
                metadata: {
                  situation: formData.situation,
                  relationship: formData.relationship,
                  tone: formData.tone,
                  generatedAt: new Date().toISOString()
                }
              };
              setResult(finalResult);
              setLoading(false);
              setStreamingText('');
            }

            if (parsed.type === 'error') {
              const type = parsed.error === 'OLLAMA_NOT_RUNNING' || parsed.error === 'MODEL_NOT_FOUND' ? 'setup' : 'general';
              setError({ type, message: parsed.message });
              setLoading(false);
              return;
            }

          } catch (parseErr) {
            // Ignore malformed SSE events
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setLoading(false);
        return;
      }
      if (err.message.includes('fetch')) {
        setError({ type: 'setup', message: 'Cannot reach backend on port 3001. Is it running?' });
      } else {
        setError({ type: 'general', message: 'Stream failed: ' + err.message });
      }
      setLoading(false);
    }
  };

  const cancel = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
    setStreamingText('');
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setStreamingText('');
    setStatusMessage('');
  };

  return { generate, loading, error, result, streamingText, statusMessage, cancel, reset };
}

function cleanStreamingText(text) {
  const preambles = [
    /^(here is|here's|sure,?|certainly,?|of course,?|i('ve| have) written|below is)[^:.\n]*[:.]\s*/i,
    /^\*\*[^*]+\*\*\n+/,
  ];
  let cleaned = text;
  for (const p of preambles) cleaned = cleaned.replace(p, '');
  return cleaned;
}
