"""
Personal Operating System - Content Service

Manages all editable page content stored as JSON.
"""
import json
from pathlib import Path
from config import CONTENT_FILE

VALID_SECTIONS = [
    "hero", "about", "vision", "goals", "projects",
    "skills", "timeline", "learning", "achievements", "footer", "ups_downs"
]

DEFAULT_CONTENT = {
    "hero": {
        "greeting": "Welcome back,",
        "name": "Future Builder",
        "tagline": "Computer Science Student • Systems Engineer • Builder",
        "stats": [
            {"label": "Projects", "value": "67"},
            {"label": "Mastery", "value": "15%"}
        ]
    },
    "about": {
        "story": "I'm a Computer Science student on a mission to become a world-class systems engineer. This Personal Operating System is my proof-of-work — a private digital system tracking every project, failure, breakthrough, and realization over the next decade.",
        "philosophy_title": "Why I Built This",
        "philosophy_text": "Traditional portfolios are performance. This is truth. Every entry is timestamped, Git-versioned, and immutable after 48 hours. No rewriting history. No pretending. Just raw documentation of who I am becoming.",
        "values": [
            {"icon": "🎯", "title": "Depth over Breadth", "desc": "Master few things completely."},
            {"icon": "📝", "title": "Document Everything", "desc": "If it's not written, it didn't happen."},
            {"icon": "🔥", "title": "Embrace Failure", "desc": "Struggles are data, not shame."}
        ]
    },
    "vision": {
        "text": "To become a world-class systems engineer who builds software that matters. To master the fundamentals so deeply that complexity becomes simple. To help others grow while never stopping my own growth."
    },
    "goals": [
        {
            "timeframe": "1 Year",
            "title": "Foundation Year",
            "items": [
                "Complete 500 DSA problems",
                "Build 3 full-stack projects",
                "Secure internship at top company",
                "365-day journal streak"
            ],
            "progress": 35
        },
        {
            "timeframe": "5 Years",
            "title": "Mastery Phase",
            "items": [
                "Senior Engineer at top company",
                "Open source contributor",
                "Technical blog 10K readers",
                "Mentor 5+ developers"
            ],
            "progress": 10
        },
        {
            "timeframe": "10 Years",
            "title": "Impact Phase",
            "items": [
                "Lead engineering at company I believe in",
                "Build product used by millions",
                "Give back through teaching",
                "Financial independence"
            ],
            "progress": 5
        }
    ],
    "projects": {
        "total": 67,
        "active": 7,
        "done": 1,
        "current_phase": {
            "name": "Phase 0 — Foundational Projects",
            "quote": "These are NOT optional. They build muscle.",
            "started": 7,
            "total": 67,
            "progress": 15
        },
        "phases": [
            {
                "badge": "Phase 0",
                "name": "🧱 Foundational / Enabling",
                "desc": "Build muscle. NOT optional.",
                "completion": "2/7 started • ~28%",
                "is_active": True,
                "is_locked": False,
                "roadmap_progress": 28,
                "projects": [
                    {"name": "DSA Library", "tech": "C/C++/Rust", "status": "active"},
                    {"name": "CP Judge Engine", "tech": "Go/Python", "status": "planned"},
                    {"name": "Mini Shell", "tech": "C", "status": "active"},
                    {"name": "Linux Internals", "tech": "C/Rust", "status": "planned"},
                    {"name": "Memory Allocator", "tech": "C", "status": "planned"},
                    {"name": "Static Analyzer", "tech": "Python", "status": "planned"},
                    {"name": "Search Engine", "tech": "Python/Go", "status": "active"}
                ]
            },
            {
                "badge": "Phase 1",
                "name": "⚙️ Core Systems",
                "desc": "OS, Compiler, P2P",
                "completion": "1/8 started • ~12%",
                "is_active": False,
                "is_locked": False,
                "roadmap_progress": 12,
                "projects": [
                    {"name": "Unix-like OS Kernel", "tech": "C/Asm", "status": "planned"},
                    {"name": "xv6 Extensions", "tech": "C", "status": "planned"},
                    {"name": "Compiler (Lexer+Parser)", "tech": "Rust", "status": "active"},
                    {"name": "Compiler Optimizer", "tech": "LLVM", "status": "planned"},
                    {"name": "Bytecode VM", "tech": "C/Rust", "status": "planned"},
                    {"name": "Full Language", "tech": "Rust", "status": "planned"},
                    {"name": "P2P Protocol", "tech": "Go", "status": "planned"},
                    {"name": "Load Balancer", "tech": "Go/C", "status": "planned"}
                ]
            },
            {
                "badge": "Phase 2",
                "name": "🌐 Distributed Systems",
                "desc": "GFS, Raft, DB Engine, Messaging",
                "completion": "0/5 • Unlocks after Phase 1",
                "is_active": False,
                "is_locked": True,
                "roadmap_progress": 0,
                "projects": []
            },
            {
                "badge": "Phase 3",
                "name": "🖥️ Hardware-Software",
                "desc": "ISA, CPU, Hypervisor, Universal VM",
                "completion": "0/4 • Unlocks after Phase 2",
                "is_active": False,
                "is_locked": True,
                "roadmap_progress": 0,
                "projects": []
            },
            {
                "badge": "Phase 4",
                "name": "🔐 Security & Analysis",
                "desc": "RE, Red Team, Symbolic Exec, Formal Verification",
                "completion": "1/8 • ~5%",
                "is_active": False,
                "is_locked": False,
                "roadmap_progress": 5,
                "projects": []
            },
            {
                "badge": "Phase 5",
                "name": "🤖 AI Systems",
                "desc": "NN Framework, RL, Causal AI, Multi-Agent",
                "completion": "1/6 • ~8%",
                "is_active": False,
                "is_locked": False,
                "roadmap_progress": 8,
                "projects": []
            },
            {
                "badge": "Phase 6-10",
                "name": "📈 Advanced Phases",
                "desc": "FinTech, Education, AI Platforms, Research, Government",
                "completion": "1/29 • ~2%",
                "is_active": False,
                "is_locked": False,
                "roadmap_progress": 2,
                "projects": []
            }
        ]
    },
    "skills": {
        "languages": [
            {"name": "Python", "level": "Expert", "progress": 90, "years": "3+ years • FastAPI, ML, Automation"},
            {"name": "C/C++", "level": "Advanced", "progress": 75, "years": "2+ years • Systems, DSA, Memory"},
            {"name": "JavaScript/TypeScript", "level": "Advanced", "progress": 70, "years": "2+ years • React, Node, Full-Stack"},
            {"name": "Rust", "level": "Intermediate", "progress": 50, "years": "1 year • Learning for systems"},
            {"name": "Go", "level": "Intermediate", "progress": 45, "years": "6 months • CLI, Backend"},
            {"name": "SQL", "level": "Advanced", "progress": 70, "years": "2+ years • PostgreSQL, SQLite"}
        ],
        "technologies": [
            {"name": "FastAPI", "category": "backend"},
            {"name": "Django", "category": "backend"},
            {"name": "Node.js", "category": "backend"},
            {"name": "React", "category": "frontend"},
            {"name": "Next.js", "category": "frontend"},
            {"name": "PostgreSQL", "category": "db"},
            {"name": "SQLite", "category": "db"},
            {"name": "Redis", "category": "db"},
            {"name": "Docker", "category": "devops"},
            {"name": "Git", "category": "devops"},
            {"name": "Linux", "category": "devops"},
            {"name": "PyTorch", "category": "ml"},
            {"name": "TensorFlow", "category": "ml"},
            {"name": "LangChain", "category": "ml"},
            {"name": "Ghidra", "category": "security"},
            {"name": "x64dbg", "category": "security"},
            {"name": "Burp Suite", "category": "security"}
        ],
        "competencies": [
            {"icon": "🔧", "title": "Systems Programming", "desc": "OS internals, memory management, compilers, low-level optimization"},
            {"icon": "🌐", "title": "Backend Development", "desc": "API design, databases, authentication, scalable architecture"},
            {"icon": "🔐", "title": "Security & RE", "desc": "Reverse engineering, malware analysis, penetration testing"},
            {"icon": "🤖", "title": "Machine Learning", "desc": "Neural networks, NLP, LLM applications, data pipelines"}
        ]
    },
    "timeline": [
        {
            "year": "2026",
            "events": [
                {"date": "January 18", "title": "Created Personal Operating System", "desc": "Built a comprehensive system to track life, projects, and growth. The beginning of intentional documentation.", "type": "achievement", "tag": "🚀 Milestone"},
                {"date": "January", "title": "Started DSA Deep Dive", "desc": "Committed to 500 problems. Currently at 150+. Focusing on patterns over memorization.", "type": "learning", "tag": "📚 Learning"},
                {"date": "January", "title": "Completed Text-to-Handwriting Project", "desc": "Web app that converts typed text to realistic handwriting. First completed project in the master plan.", "type": "achievement", "tag": "🏆 Achievement"}
            ]
        },
        {
            "year": "2025",
            "events": [
                {"date": "December", "title": "First Reverse Engineering Success", "desc": "Analyzed and documented a cracked software's protection mechanism. Sparked interest in security.", "type": "achievement", "tag": "🏆 Achievement"},
                {"date": "August", "title": "Started B.Tech in Computer Science", "desc": "Enrolled in CSE program. Began formal education while continuing self-study.", "type": "learning", "tag": "🎓 Education"},
                {"date": "March", "title": "First Major Burnout", "desc": "Overworked for 2 months straight. Learned about sustainable pace and recovery.", "type": "struggle", "tag": "🔥 Struggle"}
            ]
        },
        {
            "year": "2024",
            "events": [
                {"date": "June", "title": "Discovered Systems Programming", "desc": "Read \"Operating Systems: Three Easy Pieces.\" Mind = blown. Decided to focus on systems.", "type": "learning", "tag": "📚 Learning"},
                {"date": "January", "title": "First Python Project", "desc": "Built a simple automation script. The spark that started everything.", "type": "achievement", "tag": "🏆 Achievement"}
            ]
        }
    ],
    "learning": {
        "books": [
            {"title": "Introduction to Solid State Physics", "author": "Kittel", "emoji": "📕", "progress": 25, "chapter_text": "Chapter 3/20 • 25%"},
            {"title": "Higher Engineering Mathematics", "author": "B.S. Grewal", "emoji": "📗", "progress": 40, "chapter_text": "Chapter 8/20 • 40%"},
            {"title": "Operating Systems: Three Easy Pieces", "author": "Arpaci-Dusseau", "emoji": "📘", "progress": 60, "chapter_text": "Chapter 24/40 • 60%"},
            {"title": "Crafting Interpreters", "author": "Robert Nystrom", "emoji": "📙", "progress": 35, "chapter_text": "Chapter 11/30 • 35%"}
        ],
        "courses": [
            {"title": "CS50: Introduction to Computer Science", "provider": "Harvard • Completed Dec 2024", "status": "completed"},
            {"title": "MIT 6.824: Distributed Systems", "provider": "MIT OpenCourseWare • 40% complete", "status": "in-progress"},
            {"title": "Nand2Tetris: Building a Modern Computer", "provider": "Coursera • 60% complete", "status": "in-progress"},
            {"title": "Stanford CS144: Computer Networks", "provider": "Planned for Q2 2026", "status": "planned"}
        ],
        "stats": [
            {"value": "4", "label": "Books in Progress"},
            {"value": "1", "label": "Courses Completed"},
            {"value": "150+", "label": "DSA Problems"},
            {"value": "~500", "label": "Hours Studied (2025)"}
        ]
    },
    "achievements": {
        "certifications": [
            {"badge": "🛡️", "title": "TryHackMe — Advent of Cyber 2024", "desc": "Completed 25-day cybersecurity challenge", "date": "December 2024"},
            {"badge": "💻", "title": "CS50 Certificate", "desc": "Harvard's Introduction to Computer Science", "date": "December 2024"},
            {"badge": "🔒", "title": "HackTheBox — Starting Point", "desc": "In Progress — 60% complete", "date": "Expected: Feb 2026", "in_progress": True}
        ],
        "competitions": [
            {"icon": "🥈", "title": "College Hackathon — 2nd Place", "desc": "Built a real-time collaborative editor in 24 hours", "date": "November 2025"},
            {"icon": "🎯", "title": "LeetCode Contest — Top 15%", "desc": "Weekly Contest 380 — Solved 3/4 problems", "date": "January 2026"}
        ],
        "academic": [
            {"icon": "📊", "title": "Semester 1 — 8.5 CGPA", "desc": "Strong performance in first semester of B.Tech CSE", "date": "December 2025"}
        ]
    },
    "footer": {
        "tagline": "Personal Operating System",
        "description": "Built with intention. Documented with truth.",
        "social_links": [
            {"name": "GitHub", "url": "https://github.com"},
            {"name": "LinkedIn", "url": "https://linkedin.com"},
            {"name": "Twitter", "url": "https://twitter.com"}
        ]
    },
    "ups_downs": [
        {"type": "up", "text": "Started Personal OS — feeling clear and motivated"},
        {"type": "down", "text": "Procrastinated entire day. Felt unproductive."},
        {"type": "up", "text": "Solved hard LeetCode problem. Brain felt sharp."}
    ]
}


def get_all_content() -> dict:
    """Read and return all content from JSON file."""
    if not CONTENT_FILE.exists():
        init_default_content()
    
    with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_section(section: str) -> dict:
    """Get a specific content section."""
    if section not in VALID_SECTIONS:
        raise ValueError(f"Invalid section: {section}")
    
    content = get_all_content()
    return content.get(section, {})


def update_section(section: str, data) -> dict:
    """Update a specific content section."""
    if section not in VALID_SECTIONS:
        raise ValueError(f"Invalid section: {section}")
    
    content = get_all_content()
    content[section] = data
    
    with open(CONTENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    
    return content[section]


def init_default_content():
    """Initialize content.json with default values if it doesn't exist."""
    CONTENT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONTENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_CONTENT, f, indent=2, ensure_ascii=False)
    print(f"Default content initialized at {CONTENT_FILE}")
