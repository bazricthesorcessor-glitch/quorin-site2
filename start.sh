#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔════════════════════════════════════════╗"
echo "║       QUORIN — Full Stack Starter      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# ── 1. PostgreSQL ──────────────────────────────────────────────
echo "→ Checking PostgreSQL..."
if ! docker ps --format '{{.Names}}' | grep -q '^quorin-postgres$'; then
  echo "  Starting PostgreSQL container..."
  if docker ps -a --format '{{.Names}}' | grep -q '^quorin-postgres$'; then
    docker start quorin-postgres
  else
    docker run -d \
      --name quorin-postgres \
      -p 5432:5432 \
      -e POSTGRES_USER=quorin \
      -e POSTGRES_DB=quorin \
      -e POSTGRES_PASSWORD=quorin_secret \
      --restart unless-stopped \
      postgres:15
  fi
fi
# Wait for it to be ready
for i in $(seq 1 30); do
  if docker exec quorin-postgres pg_isready -q 2>/dev/null; then
    echo "  ✓ PostgreSQL ready"
    break
  fi
  sleep 1
done

# ── 2. Redis (Valkey on Arch) ─────────────────────────────────
echo "→ Checking Redis/Valkey..."
if ! systemctl is-active --quiet valkey 2>/dev/null; then
  echo "  Starting Valkey..."
  sudo systemctl start valkey
fi
echo "  ✓ Redis/Valkey ready"

# ── 3. Backend (Medusa) ───────────────────────────────────────
echo "→ Starting Medusa backend..."
cd "$SCRIPT_DIR/backend"
if lsof -i :9000 >/dev/null 2>&1; then
  echo "  Port 9000 already in use — skipping (PID: $(lsof -ti :9000))"
else
  pkill -f "node.*start-server" 2>/dev/null || true
  sleep 1
  nohup node start-server.js < /dev/null > "$SCRIPT_DIR/backend/logs/medusa.log" 2>&1 & disown
  echo "  Backend PID: $!"
  # Wait for Medusa to start (up to 30s)
  for i in $(seq 1 30); do
    if curl -sf http://localhost:9000/health >/dev/null 2>&1; then
      echo "  ✓ Backend ready (health check OK)"
      break
    fi
    sleep 1
  done
fi

# ── 4. Frontend (Vite) ────────────────────────────────────────
echo "→ Starting Vite frontend..."
cd "$SCRIPT_DIR/app"
if lsof -i :5173 >/dev/null 2>&1; then
  echo "  Port 5173 already in use — skipping (PID: $(lsof -ti :5173))"
else
  nohup node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 < /dev/null > "$SCRIPT_DIR/app/logs/vite.log" 2>&1 & disown
  echo "  Frontend PID: $!"
  sleep 3
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║       QUORIN is running!               ║"
echo "║  Frontend: http://localhost:5173       ║"
echo "║  Backend:  http://localhost:9000       ║"
echo "╚════════════════════════════════════════╝"

# Keep the script running to prevent process group termination
echo "Keeping servers alive in the background..."
tail -f /dev/null
