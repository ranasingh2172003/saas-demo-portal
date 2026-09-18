#!/bin/bash
set -e
echo "=============================================="
echo "  SaaS AI Model Lab — Codespace Setup Script"
echo "=============================================="

# ─── Install Node deps ────────────────────────────
echo "[1/4] Installing Node.js dependencies..."
npm install

# ─── Install Ollama (LLM runtime) ────────────────
echo "[2/4] Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
sleep 5

# ─── Pull LLM Models (Storage-Optimized) ─────────
echo "[3/4] Pulling Open Source Models..."

echo "  → Pulling NVIDIA Nemotron-Mini (Nvidia's highly optimized 4B model)..."
ollama pull nemotron-mini

echo "  → Pulling Llama 3.1 8B (Meta baseline)..."
ollama pull llama3.1:8b

echo "✅ LLM models pulled successfully"

# ─── Install Python AI dependencies ──────────────
echo "[4/4] Installing Python dependencies (including NVIDIA PersonaPlex)..."
sudo apt-get update && sudo apt-get install -y python3-pip libopus-dev libopus0 ffmpeg
pip3 install --quiet --upgrade pip --break-system-packages

# Coqui XTTS-v2 (premium TTS)
pip3 install --quiet TTS --break-system-packages

# Moshi / NVIDIA PersonaPlex (Speech-to-Speech)
pip3 install --quiet moshi accelerate --break-system-packages

echo ""
echo "✅ Setup Complete! All 16GB-optimized models are installed."
