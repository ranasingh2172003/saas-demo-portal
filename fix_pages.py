import re
import os

voice_file = "src/app/voice/page.tsx"
with open(voice_file, "r") as f:
    content = f.read()

content = content.replace('fetch("/api/tts"', 'fetch("http://localhost:3001/api/tts"')

with open(voice_file, "w") as f:
    f.write(content)

print("Voice fetch URL patched!")
