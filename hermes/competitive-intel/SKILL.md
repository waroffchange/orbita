---
name: competitive-intel
description: Track competitor GitHub repos and news sources, then deliver a weekly briefing to Discord.
version: 1.0.0
author: waroffchange
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [Research, Competitive, GitHub, Discord, Monitoring]
    requires_toolsets: [web, terminal]
    related_skills: [github-monitor, discord-notify]
    config:
      - key: intel.discord_webhook
        description: Discord webhook URL for weekly reports
        prompt: "Paste your Discord channel webhook URL"
        required: true
      - key: intel.targets_file
        description: Path to targets.json (repos + news sources to track)
        default: "~/.hermes/competitive-intel/targets.json"
        prompt: "Path to targets config file"
      - key: intel.report_day
        description: Day of week for weekly report (0=Sun, 1=Mon ... 6=Sat)
        default: "1"
        prompt: "Which day to send the weekly report? (0=Sun to 6=Sat)"
    blueprint:
      schedule: "0 9 * * 1"
      prompt: "/competitive-intel report"
required_environment_variables:
  - name: GITHUB_TOKEN
    prompt: GitHub personal access token (for higher API rate limits)
    help: https://github.com/settings/tokens
    required_for: GitHub repo tracking
---

# Competitive Intel

Monitor competitor GitHub repositories and news, deliver weekly briefings to Discord.

## When to Use

- `/competitive-intel add github <owner/repo>` — start tracking a GitHub repo
- `/competitive-intel add news <url>` — start tracking a news/blog source
- `/competitive-intel list` — show all tracked targets
- `/competitive-intel remove <target>` — stop tracking a target
- `/competitive-intel check` — run a manual check right now
- `/competitive-intel report` — build and send the weekly report to Discord
- `/competitive-intel setup` — first-time setup wizard

## Quick Reference

| Task | Command |
|------|---------|
| Add GitHub target | `/competitive-intel add github NousResearch/hermes-agent` |
| Add news source | `/competitive-intel add news https://example.com/blog/feed.xml` |
| Manual check | `/competitive-intel check` |
| Send report now | `/competitive-intel report` |
| List targets | `/competitive-intel list` |

## Procedure

### First-time Setup (`/competitive-intel setup`)

1. Create the data directory: `~/.hermes/competitive-intel/`
2. Create an empty `targets.json` if it does not exist (see templates/targets.json)
3. Ask the user for their Discord webhook URL and save to config
4. Ask for a GitHub token (optional but recommended)
5. Confirm the weekly report schedule (default: Monday 09:00)
6. Run an initial `/competitive-intel check` to populate baseline snapshots

### Adding a GitHub Target (`/competitive-intel add github <owner/repo>`)

1. Validate the repo exists via `GET https://api.github.com/repos/<owner/repo>`
2. Snapshot current state: stars, forks, open issues, latest release tag, last commit SHA and date
3. Append entry to `targets.json` under `"github"` array
4. Save snapshot to `~/.hermes/competitive-intel/snapshots/<owner>_<repo>.json`
5. Confirm to user: "Now tracking **owner/repo** — baseline saved."

### Adding a News Source (`/competitive-intel add news <url>`)

1. Fetch the URL; detect if it is RSS/Atom feed or an HTML page
2. If RSS/Atom: parse the 5 most recent item titles and dates as baseline
3. If HTML: extract visible text headlines as baseline
4. Append to `targets.json` under `"news"` array with `last_seen_ids` list
5. Confirm to user: "Now tracking **url**."

### Running a Check (`/competitive-intel check`)

For each **GitHub target**:
1. Fetch fresh repo data from GitHub API
2. Compare against saved snapshot:
   - Stars delta (+ or -)
   - New releases (tag not in snapshot)
   - New commits since last seen SHA (count + latest message)
   - Issue/PR count delta
3. Fetch recent commits: `GET /repos/<owner/repo>/commits?since=<last_check>`
4. Save findings to `~/.hermes/competitive-intel/findings/<date>.json`
5. Update snapshot with latest state

For each **news target**:
1. Fetch the URL
2. Parse RSS items or HTML headlines
3. Identify items not in `last_seen_ids`
4. Save new headlines with titles, URLs, dates to findings
5. Update `last_seen_ids` in `targets.json`

### Building and Sending the Report (`/competitive-intel report`)

1. Load all findings since the last report date
2. Render the report using `templates/weekly-report.md`
3. Split into Discord-safe chunks (≤ 2000 chars each)
4. POST each chunk to the Discord webhook URL:
   ```
   curl -s -X POST "<discord_webhook>" \
     -H "Content-Type: application/json" \
     -d '{"content": "<chunk>", "username": "Competitive Intel"}'
   ```
5. Save a local copy to `~/.hermes/competitive-intel/reports/<YYYY-MM-DD>.md`
6. Clear findings buffer for the next cycle

## Pitfalls

- **GitHub rate limits**: unauthenticated requests are capped at 60/hour. Always prompt for `GITHUB_TOKEN`.
- **Discord 2000-char limit**: always split messages before posting; never truncate mid-word.
- **RSS vs HTML**: some blogs have no RSS feed — fall back to HTML headline extraction but warn the user it may be less reliable.
- **Empty findings**: if nothing changed since last check, still send a brief "All quiet" report so the Discord channel gets a signal.
- **Webhook failures**: if POST returns non-2xx, log the error and retry once after 5 seconds before giving up.

## Verification

After `/competitive-intel report`:
- Check Discord channel — the report message should appear within 30 seconds
- Local copy should exist at `~/.hermes/competitive-intel/reports/<today>.md`
- Run `/competitive-intel list` — all targets should show updated `last_checked` timestamps
