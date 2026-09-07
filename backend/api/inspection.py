import json
from fastapi import APIRouter, HTTPException
from database.database import get_connection

router = APIRouter(tags=["Inspections"])


def row_to_dict(row):
    if not row:
        return None
    data = dict(row)
    data["issues"] = json.loads(data.pop("issues_json") or "[]")
    return data

@router.get("/inspections")
def get_inspections():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM inspections ORDER BY created_at DESC").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@router.get("/inspections/{inspection_id}")
def get_inspection(inspection_id: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return row_to_dict(row)
