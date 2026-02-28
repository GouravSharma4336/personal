"""
Personal Operating System - Pydantic Models

Data validation and serialization models for API.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from uuid import uuid4


# --- Auth Models ---

class PasswordSet(BaseModel):
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str
    expires_at: str


# --- Journal Models ---

class JournalMetrics(BaseModel):
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    focus: int = Field(..., ge=1, le=10)
    discipline: int = Field(..., ge=1, le=10)

class JournalEntryCreate(BaseModel):
    date: date
    metrics: JournalMetrics
    content: str

class JournalEntryUpdate(BaseModel):
    metrics: Optional[JournalMetrics] = None
    content: Optional[str] = None

class JournalEntry(BaseModel):
    id: str
    date: date
    mood: int
    energy: int
    focus: int
    discipline: int
    content: str
    locked: bool
    created_at: datetime
    locked_at: Optional[datetime] = None


# --- Daily Metrics Models ---

class DailyMetricsCreate(BaseModel):
    date: date
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    focus: int = Field(..., ge=1, le=10)
    discipline: int = Field(..., ge=1, le=10)
    coding_hours: float = Field(0, ge=0)
    study_hours: float = Field(0, ge=0)
    reading_hours: float = Field(0, ge=0)
    sleep_hours: float = Field(0, ge=0)
    notes: Optional[str] = None

class DailyMetrics(DailyMetricsCreate):
    pass


# --- Goal Models ---

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    timeframe: str = Field(..., pattern="^(1y|5y|10y|lifetime)$")
    target_date: Optional[date] = None
    milestones: Optional[List[str]] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress_pct: Optional[int] = Field(None, ge=0, le=100)
    milestones: Optional[List[str]] = None

class Goal(BaseModel):
    id: str
    title: str
    description: Optional[str]
    timeframe: str
    status: str
    progress_pct: int
    milestones: Optional[List[str]]
    created_at: datetime
    target_date: Optional[date]


# --- Analytics Models ---

class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    last_entry_date: Optional[date]

class MetricsTrend(BaseModel):
    dates: List[date]
    mood: List[int]
    energy: List[int]
    focus: List[int]
    discipline: List[int]

class HoursSummary(BaseModel):
    total_coding: float
    total_study: float
    total_reading: float
    avg_sleep: float
    period_days: int

class AnalyticsDashboard(BaseModel):
    streak: StreakInfo
    trends: MetricsTrend
    hours: HoursSummary
