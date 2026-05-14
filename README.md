# Grief Language Companion

A tool that helps people write emotionally difficult messages, powered by the Gemini 1.5 Flash API.

## Prerequisites
- Node.js 18+ (https://nodejs.org)
- Python 3.9+ (https://python.org)

## Setup (one time)
1. Clone the repository:
   ```bash
   git clone <your-repo>
   cd grief-companion
   ```
2. Install dependencies:
   ```bash
   bash scripts/setup.sh
   ```
3. Set up your `.env` files:
   Copy `backend/.env.example` to `backend/.env` and add your **MongoDB Atlas Connection String** and your **Gemini API Key**.

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

## Troubleshooting
- **"MongoDB Atlas connection failed"** → Make sure your IP address is whitelisted in MongoDB Atlas Network Access.
- **RAG service fails** → App still works — it just generates without examples.
- **Frontend can't connect** → Make sure backend is running: `cd backend && npm start`
