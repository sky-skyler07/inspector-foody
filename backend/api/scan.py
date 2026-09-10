import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile, Form

from database.database import get_connection
from services.ocr_service import extract_text
from services.validation import extract_fields, validate

router = APIRouter(tags=["Scan"])

# ---------------------------------------------------------
# Upload directory setup
# ---------------------------------------------------------
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# Scan endpoint
# ---------------------------------------------------------
@router.post("/scan")
async def scan_product(file: UploadFile = File(...),product_name:str=Form(...)):
    # 1. Broaden image content-type verification
    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }

    if file.content_type and file.content_type.lower() not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid JPEG, PNG, or WEBP image.",
        )

    inspection_id = f"INS-{uuid4().hex[:8].upper()}"
    suffix = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    image_path = UPLOAD_DIR / f"{inspection_id}{suffix}"

    # 2. Save Image File
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=400, detail="Uploaded image file is empty."
            )

        image_path.write_bytes(image_bytes)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to save image file: {exc}"
        ) from exc

    # 3. Process OCR & Extracted Data
    try:
        raw_ocr, confidence = extract_text(str(image_path))
        fields = extract_fields(raw_ocr,product_name=product_name)
        status, score, issues = validate(fields)
    except Exception as exc:
        # Cleanup file if OCR or parsing fails
        if image_path.exists():
            image_path.unlink()
        raise HTTPException(
            status_code=500, detail=f"OCR Processing Failed: {exc}"
        ) from exc

    # 4. Save to Database
    now = datetime.now(timezone.utc).isoformat()
    conn = None

    try:
        conn = get_connection()
        with conn:
            conn.execute(
                """
                INSERT INTO inspections (
                    id,
                    product_id,
                    image_path,
                    product_name,
                    batch_no,
                    manufacturing_date,
                    expiry_date,
                    mrp,
                    quantity,
                    manufacturer,
                    country_of_origin,
                    status,
                    score,
                    confidence,
                    issues_json,
                    raw_ocr,
                    inspector,
                    review_status,
                    created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                """,
                (
                    inspection_id,
                    None,
                    str(image_path),
                    fields.get("product_name"),
                    fields.get("batch_no"),
                    fields.get("manufacturing_date"),
                    fields.get("expiry_date"),
                    fields.get("mrp"),
                    fields.get("quantity"),
                    fields.get("manufacturer"),
                    fields.get("country_of_origin"),
                    status,
                    score,
                    confidence,
                    json.dumps(issues, ensure_ascii=False),
                    raw_ocr,
                    "Inspector Aanya",
                    "pending",
                    now,
                ),
            )
    except Exception as exc:
        # Delete orphan image file on DB insertion error
        if image_path.exists():
            image_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save inspection record: {exc}",
        ) from exc
    finally:
        if conn:
            conn.close()

    # 5. API Response Output
    return {
        "inspection_id": inspection_id,
        "status": status,
        "score": score,
        "confidence": confidence,
        "fields": fields,
        "issues": issues,
        "raw_ocr": raw_ocr,
    }