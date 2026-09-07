from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.scan import router as scan_router
from api.inspection import router as inspection_router
from api.reports import router as reports_router
from database.database import init_db

app = FastAPI(title="InspectFrog Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"name": "InspectFrog Backend", "status": "running", "version": "0.1.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(scan_router, prefix="/api")
app.include_router(inspection_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
