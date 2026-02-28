"""
Personal Operating System - Authentication

Simple local password authentication.
Password hash stored locally, sessions managed via tokens.
"""
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from pathlib import Path
from config import PASSWORD_HASH_FILE, SECRET_KEY, SESSION_EXPIRE_HOURS
from database import get_db


def hash_password(password: str) -> str:
    """Hash password with salt."""
    salt = SECRET_KEY.encode()
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000).hex()


def set_password(password: str) -> bool:
    """Set the system password (first-time setup or reset)."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    password_hash = hash_password(password)
    PASSWORD_HASH_FILE.parent.mkdir(parents=True, exist_ok=True)
    PASSWORD_HASH_FILE.write_text(password_hash)
    return True


def verify_password(password: str) -> bool:
    """Verify password against stored hash."""
    if not PASSWORD_HASH_FILE.exists():
        return False
    
    stored_hash = PASSWORD_HASH_FILE.read_text().strip()
    return hash_password(password) == stored_hash


def is_password_set() -> bool:
    """Check if a password has been configured."""
    return PASSWORD_HASH_FILE.exists()


def create_session() -> str:
    """Create a new session token."""
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    expires = now + timedelta(hours=SESSION_EXPIRE_HOURS)
    
    with get_db() as conn:
        conn.execute(
            "INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)",
            (token, now.isoformat(), expires.isoformat())
        )
        conn.commit()
    
    return token


def validate_session(token: str) -> bool:
    """Validate a session token."""
    if not token:
        return False
    
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT expires_at FROM sessions WHERE token = ?",
            (token,)
        )
        row = cursor.fetchone()
        
        if not row:
            return False
        
        expires_at = datetime.fromisoformat(row['expires_at'])
        if datetime.utcnow() > expires_at:
            # Clean up expired session
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return False
        
        return True


def invalidate_session(token: str) -> bool:
    """Invalidate (logout) a session."""
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    return True


def cleanup_expired_sessions():
    """Remove all expired sessions."""
    with get_db() as conn:
        conn.execute(
            "DELETE FROM sessions WHERE expires_at < ?",
            (datetime.utcnow().isoformat(),)
        )
        conn.commit()
