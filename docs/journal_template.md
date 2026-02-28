# Journal Template

> LOCKED SPECIFICATION — Do not modify after system launch.

## Frontmatter Schema

Every journal entry MUST have this exact frontmatter structure:

```yaml
---
id: <uuid-v4>
date: <YYYY-MM-DD>
mood: <1-10>
energy: <1-10>
focus: <1-10>
discipline: <1-10>
locked: <true|false>
created_at: <ISO-8601 timestamp>
locked_at: <ISO-8601 timestamp or null>
---
```

## Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID v4 | Yes | Unique identifier, never reused |
| date | YYYY-MM-DD | Yes | The date this entry covers |
| mood | Integer 1-10 | Yes | Overall emotional state |
| energy | Integer 1-10 | Yes | Physical/mental energy level |
| focus | Integer 1-10 | Yes | Ability to concentrate |
| discipline | Integer 1-10 | Yes | Adherence to commitments |
| locked | Boolean | Yes | Whether entry is immutable |
| created_at | ISO-8601 | Yes | When entry was first created |
| locked_at | ISO-8601 | No | When entry was locked (null if unlocked) |

## Rating Scale Guide

| Score | Meaning |
|-------|---------|
| 1-2 | Terrible, crisis level |
| 3-4 | Below average, struggling |
| 5-6 | Neutral, baseline |
| 7-8 | Good, above normal |
| 9-10 | Exceptional, peak state |

## File Naming Convention

```
vault/journal/YYYY/MM/DD.md
```

Example: `vault/journal/2026/01/18.md`

## Example Entry

```markdown
---
id: 550e8400-e29b-41d4-a716-446655440000
date: 2026-01-18
mood: 7
energy: 6
focus: 8
discipline: 7
locked: false
created_at: 2026-01-18T17:00:00+05:30
locked_at: null
---

# Saturday, January 18, 2026

## What I Did
- Started building the Personal Operating System
- Defined constitutional rules for the system
- Set up project structure

## What I Learned
- The importance of defining rules BEFORE writing code
- Markdown + Git = indestructible data

## What I Failed At
- Procrastinated for 2 hours before starting

## Realizations
- Building systems for future-self requires present-self discipline

## Tomorrow's Intent
- Implement the backend API for journal entries
```

## Lock Rules

1. Entries auto-lock 48 hours after `created_at`
2. Once `locked: true`, the original content CANNOT be modified
3. Addendums may be appended in a clearly marked section:

```markdown
---
## Addendum (2026-01-25)

Looking back, I realize I underestimated how long this would take.
```

---

*This schema is FROZEN. Any changes require a constitutional amendment.*
