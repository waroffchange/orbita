"""
competitive-intel report script
Reads all findings since last report, renders a Markdown report, sends to Discord.
Usage: python report.py --webhook <url>
"""
import json
import os
import sys
import datetime
import urllib.request
import urllib.error
from pathlib import Path

DATA_DIR = Path.home() / ".hermes" / "competitive-intel"
FINDINGS_DIR = DATA_DIR / "findings"
REPORTS_DIR = DATA_DIR / "reports"
TARGETS_FILE = DATA_DIR / "targets.json"


def load_findings_since(last_report_date: str) -> list[dict]:
    results = []
    if not FINDINGS_DIR.exists():
        return results
    for f in sorted(FINDINGS_DIR.glob("*.json")):
        date_str = f.stem
        if date_str >= last_report_date:
            results.append(json.loads(f.read_text()))
    return results


def merge_findings(findings: list[dict]) -> dict:
    merged = {"github": {}, "news": {}}
    for f in findings:
        for gh in f.get("github", []):
            repo = gh["repo"]
            if repo not in merged["github"]:
                merged["github"][repo] = gh
            else:
                existing = merged["github"][repo]
                existing["stars"] = gh["stars"]
                existing["stars_delta"] += gh.get("stars_delta", 0)
                existing["forks_delta"] += gh.get("forks_delta", 0)
                existing["issues_delta"] += gh.get("issues_delta", 0)
                existing["new_commits"] += gh.get("new_commits", 0)
                existing["new_releases"] = list(set(existing["new_releases"] + gh.get("new_releases", [])))
                existing["latest_commit_msg"] = gh.get("latest_commit_msg", existing["latest_commit_msg"])
        for n in f.get("news", []):
            url = n["url"]
            if url not in merged["news"]:
                merged["news"][url] = n
            else:
                seen_ids = {i["id"] for i in merged["news"][url]["new_items"]}
                for item in n.get("new_items", []):
                    if item["id"] not in seen_ids:
                        merged["news"][url]["new_items"].append(item)
    return merged


def render_report(merged: dict, date: str) -> str:
    lines = [
        f"📊 **Competitive Intel — Weekly Report**",
        f"Week of **{date}**",
        "",
        "---",
        "",
        "🐙 **GitHub Activity**",
        "",
    ]

    if not merged["github"]:
        lines.append("_(no GitHub targets tracked yet)_")
    else:
        for repo, data in merged["github"].items():
            delta_str = lambda d: f"+{d}" if d > 0 else str(d)
            lines.append(f"**`{repo}`**")
            lines.append(f"⭐ Stars: {data['stars']} ({delta_str(data['stars_delta'])})  "
                         f"🍴 Forks: {data['forks']} ({delta_str(data['forks_delta'])})")
            if data.get("new_releases"):
                lines.append(f"🚀 New releases: {', '.join(data['new_releases'])}")
            if data.get("new_commits", 0) > 0:
                lines.append(f"📝 {data['new_commits']} new commit(s) — *\"{data['latest_commit_msg']}\"*")
            if data.get("issues_delta", 0) != 0:
                lines.append(f"🐛 Issues delta: {delta_str(data['issues_delta'])}")
            lines.append("")

    lines += ["---", "", "📰 **News & Blog Updates**", ""]

    if not merged["news"]:
        lines.append("_(no news sources tracked yet)_")
    else:
        for url, data in merged["news"].items():
            lines.append(f"**{url}**")
            items = data.get("new_items", [])
            if items:
                for item in items[:5]:
                    title = item.get("title", "(no title)")
                    link = item.get("link", url)
                    date_str = item.get("date", "")
                    date_part = f" — {date_str}" if date_str else ""
                    lines.append(f"• [{title}]({link}){date_part}")
            else:
                lines.append("• _(no new posts this week)_")
            lines.append("")

    lines += ["---", "", f"*Powered by Hermes Competitive Intel*"]
    return "\n".join(lines)


def send_to_discord(webhook_url: str, content: str):
    chunks = []
    while len(content) > 1900:
        split_at = content.rfind("\n", 0, 1900)
        if split_at == -1:
            split_at = 1900
        chunks.append(content[:split_at])
        content = content[split_at:].lstrip()
    chunks.append(content)

    for chunk in chunks:
        payload = json.dumps({"content": chunk, "username": "Competitive Intel"}).encode()
        req = urllib.request.Request(webhook_url, data=payload,
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status not in (200, 204):
                    print(f"Discord warning: status {resp.status}")
        except urllib.error.HTTPError as e:
            print(f"Discord error: {e.code} {e.reason}")
            sys.exit(1)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--webhook", default=os.environ.get("DISCORD_WEBHOOK", ""))
    args = parser.parse_args()

    if not args.webhook:
        print("ERROR: Provide --webhook <url> or set DISCORD_WEBHOOK env var.")
        sys.exit(1)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # Find last report date
    existing_reports = sorted(REPORTS_DIR.glob("*.md"))
    if existing_reports:
        last_report_date = existing_reports[-1].stem
    else:
        last_report_date = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")

    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    findings = load_findings_since(last_report_date)
    merged = merge_findings(findings)
    report = render_report(merged, today)

    report_path = REPORTS_DIR / f"{today}.md"
    report_path.write_text(report, encoding="utf-8")
    print(f"Report saved to {report_path}")

    print("Sending to Discord...")
    send_to_discord(args.webhook, report)
    print("Done.")


if __name__ == "__main__":
    main()
