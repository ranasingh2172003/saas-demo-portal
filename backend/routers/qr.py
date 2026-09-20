from fastapi import APIRouter
from pydantic import BaseModel
import httpx, qrcode, io, base64

router = APIRouter()

class QRRequest(BaseModel):
    name: str
    phone: str = ""
    tagline: str = ""
    color: str = "#6C3EFF"

@router.post("/generate")
async def generate_qr(req: QRRequest):
    # Generate QR code for phone number / URL
    qr_data = req.phone or req.name
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=req.color, back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body {{ margin: 0; font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }}
  .card {{ background: white; border-radius: 20px; padding: 40px 30px; max-width: 360px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }}
  .brand-bar {{ height: 6px; border-radius: 3px; background: linear-gradient(90deg, {req.color}, #0FCCCE); margin-bottom: 28px; }}
  .name {{ font-size: 24px; font-weight: 700; color: #111; margin-bottom: 6px; }}
  .tagline {{ font-size: 13px; color: #888; margin-bottom: 24px; }}
  .qr-wrapper {{ background: #fafafa; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 20px; border: 1px solid #eee; }}
  .phone {{ font-size: 14px; color: #333; font-weight: 500; }}
  .scan-label {{ font-size: 11px; color: #bbb; margin-top: 8px; letter-spacing: 0.5px; text-transform: uppercase; }}
</style>
</head>
<body>
<div class="card">
  <div class="brand-bar"></div>
  <div class="name">{req.name}</div>
  <div class="tagline">{req.tagline or 'Scan to connect'}</div>
  <div class="qr-wrapper">
    <img src="data:image/png;base64,{qr_b64}" width="160" height="160" alt="QR Code">
  </div>
  {'<div class="phone">' + req.phone + '</div>' if req.phone else ''}
  <div class="scan-label">Scan to connect</div>
</div>
</body></html>"""
    return {"html": html}
