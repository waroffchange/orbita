# Orbita

> Daily competitive intelligence dashboard for the [Hermes Agent](https://github.com/NousResearch/hermes-agent) ecosystem.

Orbita tracks GitHub repositories and news sources in the AI agent space, runs daily checks via GitHub Actions, and publishes a live dashboard on Vercel — no database required.

---

## Features

- **Star & fork trends** — line charts across tracked repos over time
- **Commit activity** — daily commit volume per repository
- **Release tracking** — new version tags detected automatically
- **News feed** — RSS and HTML sources scraped and surfaced daily
- **Hermes skill** — install as a `/competitive-intel` slash command in Hermes Agent
- **Zero database** — findings stored as JSON files, versioned in git

## How it works

```
GitHub Actions (daily 07:00 UTC)
        │
        ▼
  check.py runs
  ├── GitHub API  →  stars, forks, commits, releases
  └── RSS / HTML  →  news headlines
        │
        ▼
  findings saved to dashboard/data/findings/YYYY-MM-DD.json
        │
        ▼
  committed & pushed to repo
        │
        ▼
  Vercel rebuilds dashboard automatically
```

## Stack

| Layer | Tech |
|-------|------|
| Dashboard | Next.js 16, Tailwind CSS, Recharts |
| Data collection | Python 3, GitHub API, RSS parsing |
| Automation | GitHub Actions (cron) |
| Hosting | Vercel |
| Agent skill | Hermes Agent (SKILL.md) |

## Hermes skill usage

```bash
# Install
cp -r hermes/competitive-intel ~/.hermes/skills/

# Add targets
/competitive-intel add github NousResearch/hermes-agent
/competitive-intel add github openai/openai-python
/competitive-intel add news https://openai.com/news/rss.xml

# Check now
/competitive-intel check

# List all targets
/competitive-intel list
```

## Self-hosting

**1. Fork this repo**

**2. Add a GitHub secret**

`GH_TOKEN` — a fine-grained personal access token with `Contents: Read & Write` on this repo (for the workflow to push findings).

**3. Deploy to Vercel**

- Root directory: `.` (repo root)
- No environment variables needed

**4. Edit targets**

Edit `hermes/competitive-intel/templates/targets.json` and push. The next daily run picks up the new targets automatically.

## Project structure

```
orbita/
├── .github/workflows/
│   └── daily-check.yml          # runs check.py, commits findings
├── app/                         # Next.js App Router pages
├── components/                  # StarChart, RepoCards, NewsFeed, ...
├── data/findings/               # JSON findings (auto-committed daily)
├── lib/                         # data loading utilities
├── public/
├── hermes/competitive-intel/
│   ├── SKILL.md                 # Hermes skill definition
│   └── scripts/
│       ├── check.py             # data collection
│       └── report.py           # (optional) Discord report
├── package.json
└── next.config.ts
```

## License

MIT
