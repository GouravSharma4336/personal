"""
Personal Operating System - FastAPI Application

Main entry point for the POS backend server.
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException, Depends, Cookie, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from datetime import date, datetime

from config import BASE_DIR
from database import init_db
from auth import (
    is_password_set, set_password, verify_password,
    create_session, validate_session, invalidate_session
)
from models import (
    PasswordSet, LoginRequest, LoginResponse,
    JournalEntryCreate, JournalEntryUpdate, JournalEntry,
    DailyMetricsCreate
)
from services import journal, analytics
from services import content as content_service

# Initialize app
app = FastAPI(
    title="Personal Operating System",
    description="Private long-term personal digital system",
    version="0.1.0"
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Startup ---

@app.on_event("startup")
async def startup():
    init_db()
    # Initialize default content if not present
    if not content_service.CONTENT_FILE.exists():
        content_service.init_default_content()


# --- Auth Dependency ---

def require_auth(session_token: Optional[str] = Cookie(None)):
    """Dependency to require authentication."""
    if not session_token or not validate_session(session_token):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return True


# --- Auth Routes ---

@app.get("/api/auth/status")
async def auth_status():
    """Check if password is set and if user is setup."""
    return {
        "password_set": is_password_set(),
        "needs_setup": not is_password_set()
    }


@app.post("/api/auth/setup")
async def setup_password(data: PasswordSet, response: Response):
    """First-time password setup."""
    if is_password_set():
        raise HTTPException(status_code=400, detail="Password already set")
    
    try:
        set_password(data.password)
        token = create_session()
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            samesite="lax",
            max_age=86400  # 24 hours
        )
        return {"success": True, "message": "Password set successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login(data: LoginRequest, response: Response):
    """Login with password."""
    if not is_password_set():
        raise HTTPException(status_code=400, detail="Password not set. Run setup first.")
    
    if not verify_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = create_session()
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400
    )
    return {"success": True}


@app.post("/api/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout and invalidate session."""
    if session_token:
        invalidate_session(session_token)
    response.delete_cookie("session_token")
    return {"success": True}


# --- Journal Routes ---

@app.post("/api/journal/entry")
async def create_journal_entry(data: JournalEntryCreate):
    """Create a new journal entry."""
    try:
        metrics = {
            'mood': data.metrics.mood,
            'energy': data.metrics.energy,
            'focus': data.metrics.focus,
            'discipline': data.metrics.discipline
        }
        entry = journal.create_entry(data.date, metrics, data.content)
        return entry
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/journal/entry/{entry_date}")
async def get_journal_entry(entry_date: date):
    """Get a journal entry by date."""
    entry = journal.get_entry(entry_date)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@app.put("/api/journal/entry/{entry_date}")
async def update_journal_entry(entry_date: date, data: JournalEntryUpdate):
    """Update a journal entry (if not locked)."""
    try:
        metrics = None
        if data.metrics:
            metrics = {
                'mood': data.metrics.mood,
                'energy': data.metrics.energy,
                'focus': data.metrics.focus,
                'discipline': data.metrics.discipline
            }
        entry = journal.update_entry(entry_date, metrics, data.content)
        return entry
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.post("/api/journal/entry/{entry_date}/lock")
async def lock_journal_entry(entry_date: date):
    """Manually lock a journal entry."""
    success = journal.lock_entry(entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"success": True, "locked": True}


@app.post("/api/journal/entry/{entry_date}/addendum")
async def add_journal_addendum(entry_date: date, text: str):
    """Add an addendum to a locked entry."""
    try:
        entry = journal.add_addendum(entry_date, text)
        return entry
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/journal/entries")
async def list_journal_entries(
    start: Optional[date] = None,
    end: Optional[date] = None,
    limit: int = 30
):
    """List journal entries."""
    entries = journal.list_entries(start, end, limit)
    return {"entries": entries, "count": len(entries)}


# --- Analytics Routes ---

@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard(days: int = 30):
    """Get full analytics dashboard data."""
    return analytics.get_full_dashboard(days)


@app.get("/api/analytics/streak")
async def get_streak():
    """Get streak information."""
    return analytics.get_streak_info()


@app.get("/api/analytics/trends")
async def get_trends(days: int = 30):
    """Get metrics trends."""
    return analytics.get_metrics_trend(days)


# --- Content Routes ---

@app.get("/api/content")
async def get_all_content():
    """Get all editable content."""
    return content_service.get_all_content()


@app.get("/api/content/{section}")
async def get_content_section(section: str):
    """Get a specific content section."""
    try:
        return content_service.get_section(section)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/content/{section}")
async def update_content_section(section: str, request: dict):
    """Update a specific content section."""
    try:
        return content_service.update_section(section, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Static Files (Frontend) ---

frontend_path = BASE_DIR / "frontend"
if frontend_path.exists():
    # Mount CSS, JS, and Images directories at their respective paths
    css_path = frontend_path / "css"
    js_path = frontend_path / "js"
    images_path = frontend_path / "images"
    
    if css_path.exists():
        app.mount("/css", StaticFiles(directory=str(css_path)), name="css")
    if js_path.exists():
        app.mount("/js", StaticFiles(directory=str(js_path)), name="js")
    if images_path.exists():
        app.mount("/images", StaticFiles(directory=str(images_path)), name="images")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse(str(frontend_path / "index.html"))


# --- Health Check ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
