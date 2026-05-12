#!/bin/bash
# Run this once after cloning the repo. It installs everything.

echo "=== Grief Language Companion Setup ==="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Download from https://nodejs.org"
  exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "ERROR: Python 3 is not installed. Download from https://python.org"
  exit 1
fi

# Check Ollama
if ! command -v ollama &> /dev/null; then
  echo "ERROR: Ollama is not installed. Download from https://ollama.com"
  exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install Python dependencies
echo "Installing Python dependencies (this may take a few minutes)..."
cd rag-service && pip3 install -r requirements.txt && cd ..

# Pull Ollama model
echo "Downloading AI model (this may take 2-5 minutes depending on internet speed)..."
ollama pull llama3.2:3b

echo ""
echo "=== Setup complete! ==="
echo "Now run: bash scripts/start-all.sh"
