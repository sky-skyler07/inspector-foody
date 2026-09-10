import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "inspectfrog.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            image_path TEXT,
            product_name TEXT,
            batch_no TEXT,
            manufacturing_date TEXT,
            expiry_date TEXT,
            mrp TEXT,
            quantity TEXT,
            manufacturer TEXT,
            country_of_origin TEXT,
            status TEXT,
            score INTEGER,
            confidence INTEGER,
            issues_json TEXT,
            raw_ocr TEXT,
            inspector TEXT,
            review_status TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
