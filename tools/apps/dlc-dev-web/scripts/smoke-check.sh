#!/usr/bin/env bash
# Simple smoke check for local dev (requires curl)
API=${API_BASE_URL:-http://localhost:30089}

echo "Checking health at $API/health";
curl -sSf "$API/health" || { echo "Health check failed"; exit 2; }

echo "Fetching strings sample..."
curl -sSf "$API/data/strings?lang=ger&limit=3" | head -c 1000 || { echo "GET /data/strings failed"; exit 3; }

echo "Smoke OK"
