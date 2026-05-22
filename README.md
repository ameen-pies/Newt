# Newt

Self-evolving AI companion in a 3D environment. Perceives your digital life via audio and screen feeds, builds a knowledge graph, and grows its own tools.

## Architecture
- **Frontend:** Vite + React + TypeScript + React Three Fiber (3D avatar/room)
- **Backend:** FastAPI + LangGraph (agent orchestration) + OpenRouter LLM
- **Memory:** Qdrant vector DB with synaptic decay
- **Sandbox:** Isolated Docker container for self-generated tools
- **Deployment:** Docker Compose

## Quick Start
```bash
cp .env.example .env    # fill in OPENROUTER_API_KEY
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Qdrant: http://localhost:6333

## Key Directories
```
Backend/
  main.py            — FastAPI entry
  config.py          — settings from .env
  routes/            — API endpoints (chat, sensory, memory, sandbox)
  services/          — brain, memory, sensory, sandbox, voice
  models/            — Pydantic schemas
  prompts/           — LLM prompt templates
  sandbox/           — self-generated tool scripts
  tests/             — pytest
Frontend/
  src/components/3d/ — Avatar, Room, AnimationController
  src/components/ui/ — Glass panels, overlays
  src/components/sensors/ — AudioCapture, ScreenCapture
  src/hooks/         — useWebSocket, useAvatar
  src/stores/        — Zustand state
  src/lib/           — api client, utils
scripts/             — setup, deploy
```

## Conventions
- No file > 500 lines
- Modular: one concern per file
- All secrets in .env, never committed
- Backend tests: `cd Backend && pytest`
