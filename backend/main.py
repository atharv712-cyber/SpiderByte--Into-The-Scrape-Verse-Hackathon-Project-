from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use SUPABASE_KEY or SUPABASE_SERVICE_KEY depending on your .env
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="SpiderByte API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Pydantic Schemas for Request Data
class ScraperCreate(BaseModel):
    name: str
    target_url: Optional[str] = None
    status: Optional[str] = "unknown"

class ScraperLogCreate(BaseModel):
    scraper_id: str
    status: str
    response_time_ms: Optional[int] = None
    error_message: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok"}

# 1. Fetch all active scrapers
@app.get("/api/scrapers")
def get_scrapers():
    try:
        response = supabase.table("scrapers").select("*").execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Add a new target scraper
@app.post("/api/scrapers")
def create_scraper(scraper: ScraperCreate):
    try:
        response = supabase.table("scrapers").insert(scraper.model_dump()).execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Add execution log entry
@app.post("/api/logs")
def create_log(log: ScraperLogCreate):
    try:
        response = supabase.table("scraper_logs").insert(log.model_dump()).execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))