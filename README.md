# Grief Language Companion

A free, local AI tool that helps people write emotionally difficult messages.

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- Python 3.9+ (https://python.org)
- Ollama (https://ollama.com)

## Setup (one time)
```bash
git clone <your-repo>
cd grief-companion
bash scripts/setup.sh
```

## Run
```bash
bash scripts/start-all.sh
```
Open http://localhost:5173

## Services
| Service | Port | Purpose |
|---------|------|---------|
| React frontend | 5173 | User interface |
| Node.js backend | 3001 | API + prompt orchestration |
| Python RAG service | 5001 | Semantic search over corpus |
| Ollama | 11434 | Local AI model |

## Troubleshooting
- **"Ollama not running"** → Run `ollama serve` in a terminal
- **Generation is slow** → Switch to `phi3:mini` in `backend/services/ollamaService.js`
- **RAG service fails** → App still works — it just generates without examples
- **Frontend can't connect** → Make sure backend is running: `cd backend && npm start`
