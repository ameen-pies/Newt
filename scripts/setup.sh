#!/bin/bash
# Newt setup script
set -e

echo "=== Newt Setup ==="

command -v docker >/dev/null 2>&1 || { echo "Docker required."; exit 1; }

# Copy env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created .env — fill in OPENROUTER_API_KEY"
else
    echo "[OK] .env exists"
fi

echo "Starting services..."
docker compose up --build -d

echo ""
echo "=== Newt running ==="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  Qdrant:   http://localhost:6333"
