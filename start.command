#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "================================================="
echo "⚡ Starting VELOX.AI Chatbot Server..."
echo "Opening in browser: http://localhost:8000"
echo "================================================="
open "http://localhost:8000"
python3 -m http.server 8000
