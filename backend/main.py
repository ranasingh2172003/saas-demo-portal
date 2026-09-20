from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import builder, linkedin, whatsapp, youtube, qr, recruitment

app = FastAPI(title="Sano AI — Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(builder.router,     prefix="/api/builder",     tags=["builder"])
app.include_router(linkedin.router,    prefix="/api/linkedin",    tags=["linkedin"])
app.include_router(whatsapp.router,    prefix="/api/whatsapp",    tags=["whatsapp"])
app.include_router(youtube.router,     prefix="/api/youtube",     tags=["youtube"])
app.include_router(qr.router,          prefix="/api/qr",          tags=["qr"])
app.include_router(recruitment.router, prefix="/api/recruitment",  tags=["recruitment"])

@app.get("/health")
async def health_check():
    import httpx
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get("http://localhost:11434")
            ollama_ok = r.status_code == 200
    except:
        ollama_ok = False
    return {"status": "ok", "service": "Sano AI Backend", "ollama": "ok" if ollama_ok else "starting"}
