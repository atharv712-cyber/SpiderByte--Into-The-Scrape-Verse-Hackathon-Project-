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
import subprocess
import json

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

    import subprocess
import json

class ScraperFromPrompt(BaseModel):
    prompt: str
    target_url: str

@app.post("/api/scrapers/generate")
def generate_scraper(payload: ScraperFromPrompt):
    result = subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", r"C:\Users\ATHARV\AppData\Roaming\npm\bdata.ps1", "scraper", "create", payload.target_url, payload.prompt, "--json"],
        capture_output=True,
        text=True,
        timeout=900
    )
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=result.stderr or result.stdout)

    if data.get("status") != "done":
        raise HTTPException(status_code=500, detail=data.get("error", "scraper creation failed"))

    new_scraper = {
        "name": payload.prompt[:50],
        "target_url": payload.target_url,
        "status": "active",
        "collector_id": data["collector_id"]
    }
    response = supabase.table("scrapers").insert(new_scraper).execute()
    return {"scraper": response.data[0], "view_url": data.get("view_url")}

@app.post("/api/scrapers/{collector_id}/run")
def run_scraper(collector_id: str, target_url: str):
    result = subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", r"C:\Users\ATHARV\AppData\Roaming\npm\bdata.ps1", "scraper", "run", collector_id, target_url, "--json"],
        capture_output=True,
        text=True,
        timeout=300
    )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=result.stderr or result.stdout)

@app.post("/api/scrapers/{collector_id}/heal")
def heal_scraper(collector_id: str, prompt: str = ""):
    result = subprocess.run(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", r"C:\Users\ATHARV\AppData\Roaming\npm\bdata.ps1", "scraper", "heal", collector_id, prompt, "--json"],
        capture_output=True,
        text=True,
        timeout=900
    )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=result.stderr or result.stdout)