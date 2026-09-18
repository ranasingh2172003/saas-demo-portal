#!/bin/bash
echo "🚀 Starting all AI services..."

# Start Ollama
ollama serve &
echo "✅ Ollama LLM API → http://localhost:11434"

# Start Coqui XTTS-v2 as OpenAI-compatible TTS server
python3 -c "
from TTS.api import TTS
import torch
from flask import Flask, request, send_file
import io, json, threading

app = Flask(__name__)
tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2', gpu=False)

@app.route('/v1/audio/speech', methods=['POST'])
def synthesize():
    data = request.json
    text = data.get('input', data.get('text', ''))
    wav = tts.tts(text=text, speaker='Claribel Dervla', language='en')
    import soundfile as sf
    buf = io.BytesIO()
    sf.write(buf, wav, 22050, format='WAV')
    buf.seek(0)
    return send_file(buf, mimetype='audio/wav')

app.run(port=8881, host='0.0.0.0')
" &
echo "✅ Coqui XTTS-v2 TTS → http://localhost:8881"

sleep 3
echo ""
echo "All services are running! Test them:"
echo "  LLM:  curl http://localhost:11434/api/generate -d '{\"model\":\"gemma3:12b\",\"prompt\":\"Hello\",\"stream\":false}'"
echo "  TTS:  curl -X POST http://localhost:8881/v1/audio/speech -H 'Content-Type: application/json' -d '{\"input\":\"Hello world\"}' --output test.wav"
