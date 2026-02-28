"""
Personal Operating System - Database Layer

SQLite is used as an INDEX/CACHE only.
Source of truth: Markdown files in /vault
Per docs/source_of_truth.md
"""
import sqlite3
from pathlib import Path
from contextlib import contextmanager
from config import DB_PATH

SCHEMA = """
-- Core entry system (index of all vault content)
CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_locked INTEGER DEFAULT 0,
    locked_at TEXT
);

-- Daily metrics for analytics
CREATE TABLE IF NOT EXISTS daily_metrics (
    date TEXT PRIMARY KEY,
    mood INTEGER CHECK (mood BETWEEN 1 AND 10),
    energy INTEGER CHECK (energy BETWEEN 1 AND 10),
    focus INTEGER CHECK (focus BETWEEN 1 AND 10),
    discipline INTEGER CHECK (discipline BETWEEN 1 AND 10),
    coding_hours REAL DEFAULT 0,
    study_hours REAL DEFAULT 0,
    reading_hours REAL DEFAULT 0,
    sleep_hours REAL DEFAULT 0,
    notes TEXT
);

-- Long-term goals tracking
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT CHECK (timeframe IN ('1y', '5y', '10y', 'lifetime')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'paused')),
    progress_pct INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    milestones TEXT,
    created_at TEXT NOT NULL,
    target_date TEXT
);

-- Principles and philosophies
CREATE TABLE IF NOT EXISTS principles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
);

-- Skills tracking
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    current_level INTEGER CHECK (current_level BETWEEN 1 AND 10),
    target_level INTEGER CHECK (target_level BETWEEN 1 AND 10),
    hours_invested REAL DEFAULT 0,
    started_at TEXT NOT NULL
);

-- Tags (hierarchical)
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    parent_id TEXT,
    FOREIGN KEY (parent_id) REFERENCES tags(id)
);

-- Entry-Tag relationship
CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id TEXT,
    tag_id TEXT,
    PRIMARY KEY (entry_id, tag_id),
    FOREIGN KEY (entry_id) REFERENCES entries(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- Session tokens for auth
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

-- Create indices for common queries
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
"""


def init_db():
    """Initialize the database with schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(SCHEMA)
        conn.commit()
    print(f"Database initialized at {DB_PATH}")


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def rebuild_index_from_vault():
    """
    Rebuild SQLite index from vault Markdown files.
    This ensures SQLite is always derivable from source of truth.
    """
    # TODO: Implement full vault scanning and re-indexing
    pass


if __name__ == "__main__":
    init_db()
