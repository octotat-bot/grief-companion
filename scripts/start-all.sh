#!/bin/bash
# Starts all three services in separate terminal processes.

echo "Starting all services..."

# Start Ollama
ollama serve &
sleep 2

# Start Python RAG service
(cd rag-service && python3 app.py) &
sleep 3

# Start Node.js backend
(cd backend && npm start) &
sleep 1

# Start React frontend
(cd frontend && npm run dev) &

echo ""
echo "=== All services started ==="
echo "Open http://localhost:5173 in your browser"
echo "Press Ctrl+C to stop all services"

wait
