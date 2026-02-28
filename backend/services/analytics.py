"""
Personal Operating System - Analytics Service

Computes derived analytics from source data.
All analytics are Tier 3 (disposable) per source_of_truth.md.
"""
from datetime import date, timedelta
from typing import List, Optional
from database import get_db


def get_streak_info() -> dict:
    """Calculate current and longest journal entry streaks."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT date FROM daily_metrics ORDER BY date DESC"
        )
        dates = [row['date'] for row in cursor.fetchall()]
    
    if not dates:
        return {
            'current_streak': 0,
            'longest_streak': 0,
            'last_entry_date': None
        }
    
    # Convert to date objects
    date_objs = sorted([date.fromisoformat(d) for d in dates], reverse=True)
    
    # Calculate current streak
    current_streak = 0
    today = date.today()
    expected = today
    
    for d in date_objs:
        if d == expected or d == expected - timedelta(days=1):
            current_streak += 1
            expected = d - timedelta(days=1)
        else:
            break
    
    # Calculate longest streak
    longest_streak = 1
    streak = 1
    
    for i in range(1, len(date_objs)):
        if date_objs[i-1] - date_objs[i] == timedelta(days=1):
            streak += 1
            longest_streak = max(longest_streak, streak)
        else:
            streak = 1
    
    return {
        'current_streak': current_streak,
        'longest_streak': max(longest_streak, current_streak),
        'last_entry_date': date_objs[0].isoformat() if date_objs else None
    }


def get_metrics_trend(days: int = 30) -> dict:
    """Get mood/energy/focus/discipline trends over time."""
    start_date = (date.today() - timedelta(days=days)).isoformat()
    
    with get_db() as conn:
        cursor = conn.execute(
            """SELECT date, mood, energy, focus, discipline 
               FROM daily_metrics 
               WHERE date >= ? 
               ORDER BY date ASC""",
            (start_date,)
        )
        rows = cursor.fetchall()
    
    return {
        'dates': [row['date'] for row in rows],
        'mood': [row['mood'] for row in rows],
        'energy': [row['energy'] for row in rows],
        'focus': [row['focus'] for row in rows],
        'discipline': [row['discipline'] for row in rows]
    }


def get_hours_summary(days: int = 30) -> dict:
    """Get summary of hours tracked over a period."""
    start_date = (date.today() - timedelta(days=days)).isoformat()
    
    with get_db() as conn:
        cursor = conn.execute(
            """SELECT 
                 SUM(coding_hours) as total_coding,
                 SUM(study_hours) as total_study,
                 SUM(reading_hours) as total_reading,
                 AVG(sleep_hours) as avg_sleep,
                 COUNT(*) as days_tracked
               FROM daily_metrics 
               WHERE date >= ?""",
            (start_date,)
        )
        row = cursor.fetchone()
    
    return {
        'total_coding': row['total_coding'] or 0,
        'total_study': row['total_study'] or 0,
        'total_reading': row['total_reading'] or 0,
        'avg_sleep': round(row['avg_sleep'] or 0, 1),
        'period_days': row['days_tracked'] or 0
    }


def get_metrics_averages(days: int = 30) -> dict:
    """Get average metrics over a period."""
    start_date = (date.today() - timedelta(days=days)).isoformat()
    
    with get_db() as conn:
        cursor = conn.execute(
            """SELECT 
                 AVG(mood) as avg_mood,
                 AVG(energy) as avg_energy,
                 AVG(focus) as avg_focus,
                 AVG(discipline) as avg_discipline
               FROM daily_metrics 
               WHERE date >= ?""",
            (start_date,)
        )
        row = cursor.fetchone()
    
    return {
        'avg_mood': round(row['avg_mood'] or 0, 1),
        'avg_energy': round(row['avg_energy'] or 0, 1),
        'avg_focus': round(row['avg_focus'] or 0, 1),
        'avg_discipline': round(row['avg_discipline'] or 0, 1)
    }


def get_full_dashboard(days: int = 30) -> dict:
    """Get complete analytics dashboard data."""
    return {
        'streak': get_streak_info(),
        'trends': get_metrics_trend(days),
        'hours': get_hours_summary(days),
        'averages': get_metrics_averages(days)
    }
