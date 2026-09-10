from fastapi import APIRouter, HTTPException
from database.database import get_connection
from api.inspection import row_to_dict

router = APIRouter(tags=["Reports"])

@router.get("/reports")
def get_reports():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM inspections ORDER BY created_at DESC").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@router.get("/reports/{inspection_id}")
def get_report(inspection_id: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Report not found")
    return row_to_dict(row)
