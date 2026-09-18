#!/bin/bash
set -e
echo "=============================================="
echo "  SaaS AI Model Lab — Codespace Setup Script"
echo "=============================================="

# ─── Install Node deps ────────────────────────────
echo "[1/6] Installing Node.js dependencies..."
npm install

# ─── Install Ollama (LLM runtime) ────────────────
echo "[2/6] Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama in background
ollama serve &
sleep 5
echo "✅ Ollama running on port 11434"

# ─── Pull LLM Models ─────────────────────────────
echo "[3/6] Pulling LLM models (this takes a few minutes)..."

echo "  → Pulling Gemma 3 12B (Google, best quality for 12GB)..."
ollama pull gemma3:12b

echo "  → Pulling Qwen 2.5 7B (Alibaba, excellent for AI agents)..."
ollama pull qwen2.5:7b

echo "  → Pulling DeepSeek R1 8B (Reasoning model)..."
ollama pull deepseek-r1:8b

echo "  → Pulling Phi-4 Mini (Microsoft, very fast + smart)..."
ollama pull phi4-mini

echo "  → Pulling Llama 3.1 8B (Meta baseline)..."
ollama pull llama3.1:8b

echo "✅ LLM models pulled successfully"

# ─── Install Python AI dependencies ──────────────
echo "[4/6] Installing Python AI/TTS dependencies..."
pip install --quiet --upgrade pip

# Coqui XTTS-v2 (premium TTS)
pip install --quiet TTS

# F5-TTS (ultra-realistic TTS)
pip install --quiet git+https://github.com/SWivid/F5-TTS.git || echo "F5-TTS install skipped (optional)"

# Sesame CSM-1B (conversational TTS)
pip install --quiet huggingface_hub soundfile scipy torchaudio

# Moshi / PersonaPlex (Speech-to-Speech)
pip install --quiet moshi || echo "Moshi install skipped (optional — install libopus-dev first)"

# Whisper (STT)
pip install --quiet openai-whisper

echo "✅ Python AI packages installed"

# ─── Download Coqui XTTS-v2 model ────────────────
echo "[5/6] Pre-downloading Coqui XTTS-v2 model weights..."
python3 -c "
from TTS.api import TTS
import torch
tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2', gpu=False)
print('XTTS-v2 model downloaded successfully')
" || echo "XTTS-v2 pre-download deferred"

# ─── Install opus for Moshi ───────────────────────
echo "[6/6] Installing system dependencies for Moshi..."
sudo apt-get install -y libopus-dev libopus0 ffmpeg 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   🎉 SaaS AI Model Lab is READY!            ║"
echo "║                                              ║"
echo "║  Ollama API:      http://localhost:11434     ║"
echo "║  Models installed:                           ║"
echo "║    • gemma3:12b   (12B, Google)              ║"
echo "║    • qwen2.5:7b   (7B, Alibaba)              ║"
echo "║    • deepseek-r1:8b (8B, Reasoning)          ║"
echo "║    • phi4-mini    (3.8B, Microsoft)          ║"
echo "║    • llama3.1:8b  (8B, Meta)                 ║"
echo "║                                              ║"
echo "║  TTS Engines:                                ║"
echo "║    • Coqui XTTS-v2 (port 8881)               ║"
echo "║    • Moshi/PersonaPlex (port 8998)           ║"
echo "║                                              ║"
echo "║  Run: bash .devcontainer/start_services.sh   ║"
echo "╚══════════════════════════════════════════════╝"
