#!/bin/bash
echo "Starting Grief Language Companion..."
echo ""
echo "MongoDB: Using Atlas (cloud) — no local start needed"
echo ""

# Start Python RAG service
echo "Starting RAG service..."
(cd rag-service && python3 app.py) &
sleep 4

# Start Node.js backend
echo "Starting backend..."
(cd backend && npm start) &
sleep 1

# Start React frontend
echo "Starting frontend..."
(cd frontend && npm run dev) &

echo ""
echo "=== All services running ==="
echo "Open: http://localhost:5173"
echo ""
echo "Services:"
echo "  Frontend  → http://localhost:5173"
echo "  Backend   → http://localhost:3001"
echo "  RAG       → http://localhost:5001"
echo "  MongoDB   → Atlas (cloud)"
echo ""
echo "Press Ctrl+C to stop."
wait
