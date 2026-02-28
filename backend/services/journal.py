"""
Personal Operating System - Journal Service

Handles journal entries with Markdown file storage (source of truth)
and SQLite indexing (cache).
"""
import uuid
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List
from config import JOURNAL_DIR, JOURNAL_LOCK_HOURS
from database import get_db


def _get_entry_path(entry_date) -> Path:
    """Get the file path for a journal entry by date."""
    return JOURNAL_DIR / str(entry_date.year) / f"{entry_date.month:02d}" / f"{entry_date.day:02d}.md"


def _parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from Markdown content."""
    if not content.startswith('---'):
        return {}, content
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content
    
    try:
        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()
        return frontmatter or {}, body
    except yaml.YAMLError:
        return {}, content


def _build_entry_content(entry_id: str, entry_date, metrics: dict, content: str, locked: bool = False) -> str:
    """Build full Markdown content with frontmatter."""
    now = datetime.utcnow()
    
    frontmatter = {
        'id': entry_id,
        'date': str(entry_date),
        'mood': metrics['mood'],
        'energy': metrics['energy'],
        'focus': metrics['focus'],
        'discipline': metrics['discipline'],
        'locked': locked,
        'created_at': now.isoformat(),
        'locked_at': None
    }
    
    yaml_str = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)
    return f"---\n{yaml_str}---\n\n{content}"


def create_entry(entry_date, metrics: dict, content: str) -> dict:
    """Create a new journal entry."""
    path = _get_entry_path(entry_date)
    
    if path.exists():
        raise ValueError(f"Entry already exists for {entry_date}")
    
    entry_id = str(uuid.uuid4())
    full_content = _build_entry_content(entry_id, entry_date, metrics, content)
    
    # Write to filesystem (source of truth)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(full_content, encoding='utf-8')
    
    # Index in SQLite
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            """INSERT INTO entries (id, entry_type, title, content_path, created_at, updated_at, is_locked)
               VALUES (?, 'journal', ?, ?, ?, ?, 0)""",
            (entry_id, f"Journal: {entry_date}", str(path.relative_to(path.parent.parent.parent.parent)), now, now)
        )
        conn.execute(
            """INSERT OR REPLACE INTO daily_metrics (date, mood, energy, focus, discipline)
               VALUES (?, ?, ?, ?, ?)""",
            (str(entry_date), metrics['mood'], metrics['energy'], metrics['focus'], metrics['discipline'])
        )
        conn.commit()
    
    return get_entry(entry_date)


def get_entry(entry_date) -> Optional[dict]:
    """Get a journal entry by date."""
    path = _get_entry_path(entry_date)
    
    if not path.exists():
        return None
    
    content = path.read_text(encoding='utf-8')
    frontmatter, body = _parse_frontmatter(content)
    
    # Check if auto-lock should apply
    created_at = datetime.fromisoformat(frontmatter.get('created_at', datetime.utcnow().isoformat()))
    should_lock = datetime.utcnow() > created_at + timedelta(hours=JOURNAL_LOCK_HOURS)
    
    if should_lock and not frontmatter.get('locked', False):
        # Auto-lock the entry
        lock_entry(entry_date)
        frontmatter['locked'] = True
        frontmatter['locked_at'] = datetime.utcnow().isoformat()
    
    return {
        'id': frontmatter.get('id'),
        'date': entry_date,
        'mood': frontmatter.get('mood'),
        'energy': frontmatter.get('energy'),
        'focus': frontmatter.get('focus'),
        'discipline': frontmatter.get('discipline'),
        'content': body,
        'locked': frontmatter.get('locked', False),
        'created_at': frontmatter.get('created_at'),
        'locked_at': frontmatter.get('locked_at')
    }


def update_entry(entry_date, metrics: Optional[dict] = None, content: Optional[str] = None) -> dict:
    """Update an existing journal entry (only if not locked)."""
    path = _get_entry_path(entry_date)
    
    if not path.exists():
        raise ValueError(f"No entry exists for {entry_date}")
    
    existing = get_entry(entry_date)
    
    if existing['locked']:
        raise PermissionError(f"Entry for {entry_date} is locked and cannot be modified")
    
    # Merge updates
    new_metrics = metrics if metrics else {
        'mood': existing['mood'],
        'energy': existing['energy'],
        'focus': existing['focus'],
        'discipline': existing['discipline']
    }
    new_content = content if content is not None else existing['content']
    
    # Rebuild file
    full_content = _build_entry_content(existing['id'], entry_date, new_metrics, new_content)
    path.write_text(full_content, encoding='utf-8')
    
    # Update index
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            "UPDATE entries SET updated_at = ? WHERE id = ?",
            (now, existing['id'])
        )
        conn.execute(
            """INSERT OR REPLACE INTO daily_metrics (date, mood, energy, focus, discipline)
               VALUES (?, ?, ?, ?, ?)""",
            (str(entry_date), new_metrics['mood'], new_metrics['energy'], new_metrics['focus'], new_metrics['discipline'])
        )
        conn.commit()
    
    return get_entry(entry_date)


def lock_entry(entry_date) -> bool:
    """Manually lock an entry."""
    path = _get_entry_path(entry_date)
    
    if not path.exists():
        return False
    
    content = path.read_text(encoding='utf-8')
    frontmatter, body = _parse_frontmatter(content)
    
    if frontmatter.get('locked'):
        return True  # Already locked
    
    # Update frontmatter
    frontmatter['locked'] = True
    frontmatter['locked_at'] = datetime.utcnow().isoformat()
    
    yaml_str = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)
    new_content = f"---\n{yaml_str}---\n\n{body}"
    path.write_text(new_content, encoding='utf-8')
    
    # Update index
    with get_db() as conn:
        conn.execute(
            "UPDATE entries SET is_locked = 1 WHERE id = ?",
            (frontmatter['id'],)
        )
        conn.commit()
    
    return True


def list_entries(start_date=None, end_date=None, limit: int = 30) -> List[dict]:
    """List journal entries in a date range."""
    entries = []
    
    # Walk the journal directory
    for year_dir in sorted(JOURNAL_DIR.iterdir(), reverse=True):
        if not year_dir.is_dir():
            continue
        for month_dir in sorted(year_dir.iterdir(), reverse=True):
            if not month_dir.is_dir():
                continue
            for day_file in sorted(month_dir.glob('*.md'), reverse=True):
                if len(entries) >= limit:
                    break
                
                try:
                    day = int(day_file.stem)
                    month = int(month_dir.name)
                    year = int(year_dir.name)
                    from datetime import date
                    entry_date = date(year, month, day)
                    
                    if start_date and entry_date < start_date:
                        continue
                    if end_date and entry_date > end_date:
                        continue
                    
                    entry = get_entry(entry_date)
                    if entry:
                        entries.append(entry)
                except (ValueError, TypeError):
                    continue
    
    return entries


def add_addendum(entry_date, addendum_text: str) -> dict:
    """Add an addendum to a locked entry (per constitution.md)."""
    path = _get_entry_path(entry_date)
    
    if not path.exists():
        raise ValueError(f"No entry exists for {entry_date}")
    
    content = path.read_text(encoding='utf-8')
    
    # Add addendum section
    now = datetime.utcnow().strftime('%Y-%m-%d')
    addendum = f"\n\n---\n\n## Addendum ({now})\n\n{addendum_text}"
    new_content = content + addendum
    
    path.write_text(new_content, encoding='utf-8')
    
    return get_entry(entry_date)
