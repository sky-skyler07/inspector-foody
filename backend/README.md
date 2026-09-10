# InspectFrog Backend — Phase 1

This backend is intentionally separate from the existing Next.js frontend. No frontend files are changed.

## Stack
- FastAPI
- SQLite
- Tesseract OCR (optional at runtime)
- Pillow

## Run locally

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs for API testing.

## Endpoints
- GET /health
- POST /api/scan
- GET /api/inspections
- GET /api/inspections/{inspection_id}
- GET /api/reports
- GET /api/reports/{inspection_id}

## Current state
The frontend is NOT connected to these APIs yet. The original `lib/mock-api.ts` remains untouched.
