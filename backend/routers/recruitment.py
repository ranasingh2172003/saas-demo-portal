from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()

class JDRequest(BaseModel):
    role: str
    skills: str
    experience: str = "2-4 years"

class ScreenRequest(BaseModel):
    resume: str
    jd: Optional[str] = ""

@router.post("/jd")
async def generate_jd(req: JDRequest):
    prompt = f"""Write a professional job description for a {req.role} position.
Key skills required: {req.skills}
Experience: {req.experience}

Include: job overview, responsibilities (5-7 bullet points), requirements (5-6 bullet points), nice-to-haves, and what we offer.
Write in a professional but approachable tone. Keep it under 500 words.
Only output the JD text, no extra commentary."""

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        })
    data = resp.json()
    return {"jd": data["response"].strip()}

@router.post("/screen")
async def screen_resume(req: ScreenRequest):
    jd_context = f"Job Description:\n{req.jd}\n\n" if req.jd else ""
    prompt = f"""{jd_context}Analyse this resume and provide a hiring assessment:
Resume:
{req.resume}

Provide:
1. Overall Fit Score (1-10)
2. Top 3 Strengths
3. Top 2-3 Gaps or concerns
4. 3 Recommended interview questions
5. Hiring recommendation (Strong Yes / Yes / Maybe / No)

Be concise and direct. Format with clear numbered sections."""

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:3b",
            "prompt": prompt,
            "stream": False
        })
    data = resp.json()
    return {"analysis": data["response"].strip()}
