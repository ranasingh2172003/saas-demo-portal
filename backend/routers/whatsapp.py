from fastapi import APIRouter
from pydantic import BaseModel
import httpx, json

router = APIRouter()

class WARequest(BaseModel):
    message: str
    from_: str = "Customer"

@router.post("/reply")
async def reply(req: WARequest):
    prompt = f"""You are a friendly, professional customer support agent.
A customer named {req.from_} sent this WhatsApp message: \"{req.message}\"
Write a helpful, concise reply in 2-3 sentences. Be warm but professional. No greetings needed, go straight to the point.
Only output the reply text, nothing else."""

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        })
    data = resp.json()
    return {"reply": data["response"].strip()}
