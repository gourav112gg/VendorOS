#!/bin/sh
set -e

echo "Starting Python FastAPI ML Service on port 8000..."
(cd /app/ML_training && uvicorn app:app --host 0.0.0.0 --port 8000) &

echo "Starting Node.js Express Server on port ${PORT:-5000}..."
exec node src/server.js
