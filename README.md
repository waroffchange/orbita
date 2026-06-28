# Orbita

A Hermes Agent skill that tracks competitor GitHub repositories and news sources, then delivers a weekly briefing to Discord.

## What it does

- Monitors any GitHub repo: stars, forks, new releases, recent commits
- Monitors news/blog sources (RSS feeds or plain HTML)
- Stores findings locally in `~/.hermes/competitive-intel/`
- Sends a formatted weekly report to a Discord channel via webhook
- Runs automatically every Monday at 09:00 via Hermes cron

## Install

```bash
# Copy skill into Hermes skills directory
cp -r skills/competitive-intel ~/.hermes/skills/

# First-time setup
/competitive-intel setup
```

## Usage

```
/competitive-intel add github NousResearch/hermes-agent
/competitive-intel add github openai/openai-python
/competitive-intel add news https://openai.com/blog/rss.xml
/competitive-intel check          # manual check right now
/competitive-intel report         # send report to Discord now
/competitive-intel list           # show all tracked targets
/competitive-intel remove <name>  # stop tracking
```

## Requirements

- Hermes Agent installed
- Discord webhook URL (Settings → Integrations → Webhooks in your Discord channel)
- GitHub personal access token (optional, recommended for higher rate limits)

## File structure

```
skills/competitive-intel/
├── SKILL.md                  # Hermes skill definition
├── scripts/
│   ├── check.py              # Fetch & diff all targets
│   └── report.py             # Render & send Discord report
└── templates/
    ├── targets.json          # Example targets config
    └── weekly-report.md      # Report template reference
```

## License

MIT
