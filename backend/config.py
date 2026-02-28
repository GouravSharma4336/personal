"""
Personal Operating System - Configuration
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
VAULT_DIR = DATA_DIR / "vault"
DB_PATH = DATA_DIR / "pos.db"
CONTENT_FILE = DATA_DIR / "content.json"

# Vault subdirectories
JOURNAL_DIR = VAULT_DIR / "journal"
DECISIONS_DIR = VAULT_DIR / "decisions"
KNOWLEDGE_DIR = VAULT_DIR / "knowledge"
PROJECTS_DIR = VAULT_DIR / "projects"
ACHIEVEMENTS_DIR = VAULT_DIR / "achievements"
MEDIA_DIR = VAULT_DIR / "media"

# Security
SECRET_KEY = os.getenv("POS_SECRET_KEY", "change-this-in-production")
PASSWORD_HASH_FILE = DATA_DIR / ".password_hash"
SESSION_EXPIRE_HOURS = 24

# Journal settings
JOURNAL_LOCK_HOURS = 48  # Hours before auto-lock

# Ensure directories exist
for dir_path in [JOURNAL_DIR, DECISIONS_DIR, KNOWLEDGE_DIR, PROJECTS_DIR, ACHIEVEMENTS_DIR, MEDIA_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
