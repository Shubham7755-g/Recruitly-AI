#!/bin/sh

set -e

echo "=============================================="
echo "       RECRUITLY AI - COMBINED SERVER"
echo "=============================================="

echo "Starting FastAPI on 127.0.0.1:8000..."

python -m uvicorn app.main:app \
  --app-dir /app/backend \
  --host 127.0.0.1 \
  --port 8000 &

FASTAPI_PID=$!

echo "FastAPI PID: $FASTAPI_PID"
echo "Waiting for FastAPI..."

i=1

while [ "$i" -le 60 ]; do
  if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "FastAPI is READY."
    break
  fi

  echo "Waiting for FastAPI... ($i/60)"
  sleep 1
  i=$((i + 1))
done

if ! curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
  echo "ERROR: FastAPI failed to start."
  kill "$FASTAPI_PID" 2>/dev/null || true
  exit 1
fi

echo "=============================================="
echo "Starting Express..."
echo "Render PORT: ${PORT:-10000}"
echo "FastAPI: http://127.0.0.1:8000"
echo "=============================================="

node dist/server.cjs &
NODE_PID=$!

echo "Express PID: $NODE_PID"

# Keep the container alive while Express runs
wait "$NODE_PID"

echo "Express stopped."

kill "$FASTAPI_PID" 2>/dev/null || true

exit 1