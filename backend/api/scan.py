from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, File, UploadFile, HTTPException
from services.ocr_service import extract_text
from services.validation import extract_fields, validate
from database.database import get_connection
from datetime import datetime, timezone
import json

router = APIRouter(tags=["Scan"])
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/scan")
async def scan_product(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, or WEBP image")

    inspection_id = f"INS-{uuid4().hex[:8].upper()}"
    suffix = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    image_path = UPLOAD_DIR / f"{inspection_id}{suffix}"
    image_path.write_bytes(await file.read())

    raw_ocr, confidence = extract_text(str(image_path))
    fields = extract_fields(raw_ocr)
    status, score, issues = validate(fields)

    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    conn.execute("""
        INSERT INTO inspections
        (id, product_id, image_path, product_name, batch_no, manufacturing_date,
         expiry_date, mrp, quantity, manufacturer, country_of_origin, status,
         score, confidence, issues_json, raw_ocr, inspector, review_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inspection_id, None, str(image_path), fields.get("product_name"), fields.get("batch_no"),
        fields.get("manufacturing_date"), fields.get("expiry_date"), fields.get("mrp"),
        fields.get("quantity"), fields.get("manufacturer"), fields.get("country_of_origin"),
        status, score, confidence, json.dumps(issues), raw_ocr, "Inspector Aanya", "pending", now
    ))
    conn.commit()
    conn.close()

    return {
        "inspection_id": inspection_id,
        "status": status,
        "score": score,
        "confidence": confidence,
        "fields": fields,
        "issues": issues,
    }
