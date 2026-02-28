# Source of Truth

> This document defines the canonical hierarchy of data in the Personal Operating System.

---

## Data Hierarchy

```
┌─────────────────────────────────────────┐
│  TIER 1: SOURCE OF TRUTH (Sacred)       │
│  ─────────────────────────────────────  │
│  • Markdown files in /vault             │
│  • Git history                          │
│  • Media files (images, videos)         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  TIER 2: INDEX/CACHE (Derived)          │
│  ─────────────────────────────────────  │
│  • SQLite database (pos.db)             │
│  • Search indices                       │
│  • Tag mappings                         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  TIER 3: COMPUTED (Disposable)          │
│  ─────────────────────────────────────  │
│  • Analytics aggregations               │
│  • AI embeddings                        │
│  • AI-generated reflections             │
│  • Cached views                         │
└─────────────────────────────────────────┘
```

---

## Rules

### Tier 1: Markdown Files = Truth
- If SQLite and Markdown disagree, **Markdown wins**
- All user content is stored as plain text files
- Git provides cryptographic proof of timeline
- Files are human-readable without any software

### Tier 2: SQLite = Index Only
- SQLite is a **read-optimized cache** of Tier 1
- Can be deleted and rebuilt from Markdown files
- Used for fast queries, search, and analytics
- Never the authoritative source for content

### Tier 3: AI/Analytics = Disposable
- All computed data can be regenerated
- Deleting this tier loses nothing permanent
- Useful but not sacred

---

## Recovery Guarantee

If everything except `/vault` is deleted:
1. All content is preserved (Markdown files)
2. All history is preserved (Git)
3. SQLite can be rebuilt by re-indexing
4. AI data can be regenerated

**The vault is the ark. Everything else is scaffolding.**

---

## File Format Choices

| Type | Format | Why |
|------|--------|-----|
| Text content | Markdown (.md) | Human-readable for 50+ years |
| Metadata | YAML frontmatter | Simple, parseable, readable |
| Structured data | JSON | Universal, portable |
| Database | SQLite | Most stable DB format in existence |
| Version control | Git | Cryptographic integrity |

---

*This document itself is Tier 1 — source of truth about the source of truth.*
