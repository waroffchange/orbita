"""
competitive-intel check script
Fetches latest data for all targets and saves findings.
Usage: python check.py [--targets path/to/targets.json]
"""
import json
import os
import sys
import time
import datetime
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path

DATA_DIR = Path.home() / ".hermes" / "competitive-intel"
TARGETS_FILE = DATA_DIR / "targets.json"
SNAPSHOTS_DIR = DATA_DIR / "snapshots"
FINDINGS_DIR = DATA_DIR / "findings"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")


def github_get(path: str) -> dict:
    url = f"https://api.github.com{path}"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    if GITHUB_TOKEN:
        req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def check_github(target: dict) -> dict:
    repo = target["repo"]
    key = repo.replace("/", "_")
    snapshot_path = SNAPSHOTS_DIR / f"{key}.json"

    data = github_get(f"/repos/{repo}")
    commits = github_get(f"/repos/{repo}/commits?per_page=5")
    releases = github_get(f"/repos/{repo}/releases?per_page=5")

    old = {}
    if snapshot_path.exists():
        old = json.loads(snapshot_path.read_text())

    finding = {
        "repo": repo,
        "stars": data["stargazers_count"],
        "stars_delta": data["stargazers_count"] - old.get("stars", data["stargazers_count"]),
        "forks": data["forks_count"],
        "forks_delta": data["forks_count"] - old.get("forks", data["forks_count"]),
        "issues_delta": data["open_issues_count"] - old.get("issues", data["open_issues_count"]),
        "new_commits": 0,
        "latest_commit_msg": "",
        "new_releases": [],
    }

    if commits:
        latest_sha = commits[0]["sha"]
        old_sha = old.get("latest_sha", "")
        if old_sha and latest_sha != old_sha:
            for i, c in enumerate(commits):
                if c["sha"] == old_sha:
                    finding["new_commits"] = i
                    break
            else:
                finding["new_commits"] = len(commits)
        finding["latest_commit_msg"] = commits[0]["commit"]["message"].splitlines()[0]

    old_release_tags = set(old.get("release_tags", []))
    for r in releases:
        if r["tag_name"] not in old_release_tags:
            finding["new_releases"].append(r["tag_name"])

    new_snapshot = {
        "stars": data["stargazers_count"],
        "forks": data["forks_count"],
        "issues": data["open_issues_count"],
        "latest_sha": commits[0]["sha"] if commits else "",
        "release_tags": [r["tag_name"] for r in releases],
    }
    snapshot_path.write_text(json.dumps(new_snapshot, indent=2))
    target["last_checked"] = datetime.datetime.utcnow().isoformat()
    return finding


def fetch_rss(url: str) -> list[dict]:
    req = urllib.request.Request(url, headers={"User-Agent": "hermes-competitive-intel/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw = resp.read()
    root = ET.fromstring(raw)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    items = []
    # RSS
    for item in root.findall(".//item"):
        title = item.findtext("title", "").strip()
        link = item.findtext("link", "").strip()
        date = item.findtext("pubDate", item.findtext("dc:date", ""))
        items.append({"id": link or title, "title": title, "link": link, "date": date})
    # Atom
    for entry in root.findall("atom:entry", ns):
        title = entry.findtext("atom:title", "", ns).strip()
        link_el = entry.find("atom:link", ns)
        link = link_el.get("href", "") if link_el is not None else ""
        date = entry.findtext("atom:updated", "", ns)
        items.append({"id": link or title, "title": title, "link": link, "date": date})
    return items


def fetch_html_headlines(url: str) -> list[dict]:
    req = urllib.request.Request(url, headers={"User-Agent": "hermes-competitive-intel/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
    import re
    headings = re.findall(r"<h[1-3][^>]*>(.*?)</h[1-3]>", html, re.IGNORECASE | re.DOTALL)
    items = []
    for h in headings[:10]:
        text = re.sub(r"<[^>]+>", "", h).strip()
        if text:
            items.append({"id": text, "title": text, "link": url, "date": ""})
    return items


def check_news(target: dict) -> dict:
    url = target["url"]
    last_seen = set(target.get("last_seen_ids", []))
    try:
        items = fetch_rss(url)
        source_type = "rss"
    except Exception:
        try:
            items = fetch_html_headlines(url)
            source_type = "html"
        except Exception as e:
            return {"url": url, "error": str(e), "new_items": []}

    new_items = [i for i in items if i["id"] not in last_seen]
    target["last_seen_ids"] = list({i["id"] for i in items} | last_seen)
    target["type"] = source_type
    target["last_checked"] = datetime.datetime.utcnow().isoformat()
    return {"url": url, "new_items": new_items}


def main():
    for d in [DATA_DIR, SNAPSHOTS_DIR, FINDINGS_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    if not TARGETS_FILE.exists():
        print("No targets.json found. Run /competitive-intel setup first.")
        sys.exit(1)

    targets = json.loads(TARGETS_FILE.read_text())
    findings = {"date": datetime.datetime.utcnow().isoformat(), "github": [], "news": []}

    for t in targets.get("github", []):
        print(f"Checking GitHub: {t['repo']}")
        try:
            findings["github"].append(check_github(t))
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(1)

    for t in targets.get("news", []):
        print(f"Checking news: {t['url']}")
        try:
            findings["news"].append(check_news(t))
        except Exception as e:
            print(f"  ERROR: {e}")

    date_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    findings_path = FINDINGS_DIR / f"{date_str}.json"
    findings_path.write_text(json.dumps(findings, indent=2, ensure_ascii=True), encoding="utf-8")
    TARGETS_FILE.write_text(json.dumps(targets, indent=2, ensure_ascii=True), encoding="utf-8")
    print(f"\nDone. Findings saved to {findings_path}")


if __name__ == "__main__":
    main()
