import fs from "fs"
import path from "path"
import type { DailyFindings, RepoHistory } from "./types"

const FINDINGS_DIR = path.join(process.cwd(), "data", "findings")
const SNAPSHOTS_DIR = path.join(process.cwd(), "data", "snapshots")

function normalize(raw: any): DailyFindings {
  return {
    date: raw.date,
    github: (raw.github ?? []).map((g: any) => ({
      repo: g.repo,
      stars: g.stars ?? 0,
      starsDelta: g.stars_delta ?? g.starsDelta ?? 0,
      forks: g.forks ?? 0,
      forksDelta: g.forks_delta ?? g.forksDelta ?? 0,
      issuesDelta: g.issues_delta ?? g.issuesDelta ?? 0,
      newCommits: g.new_commits ?? g.newCommits ?? 0,
      latestCommitMsg: g.latest_commit_msg ?? g.latestCommitMsg ?? "",
      newReleases: g.new_releases ?? g.newReleases ?? [],
    })),
    news: (raw.news ?? []).map((n: any) => ({
      url: n.url,
      newItems: (n.new_items ?? n.newItems ?? []).map((i: any) => ({
        id: i.id,
        title: i.title,
        link: i.link,
        date: i.date ?? "",
      })),
      error: n.error,
    })),
  }
}

export function getAllFindings(): DailyFindings[] {
  if (!fs.existsSync(FINDINGS_DIR)) return []
  return fs
    .readdirSync(FINDINGS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => normalize(JSON.parse(fs.readFileSync(path.join(FINDINGS_DIR, f), "utf-8"))))
}

export function getLatestFindings(): DailyFindings | null {
  const all = getAllFindings()
  return all.length ? all[all.length - 1] : null
}

export function getRepoHistory(repo: string, days = 30): RepoHistory {
  const all = getAllFindings()
  const history = all.slice(-days).map((f) => {
    const gh = f.github.find((g) => g.repo === repo)
    return {
      date: f.date.slice(0, 10),
      stars: gh?.stars ?? 0,
      forks: gh?.forks ?? 0,
    }
  })
  return { repo, history }
}

export function getAllRepos(): string[] {
  const latest = getLatestFindings()
  if (!latest) return []
  return latest.github.map((g) => g.repo)
}

export function getWeeklyNewsCounts(): { source: string; count: number }[] {
  const all = getAllFindings().slice(-7)
  const counts: Record<string, number> = {}
  for (const f of all) {
    for (const n of f.news) {
      counts[n.url] = (counts[n.url] ?? 0) + n.newItems.length
    }
  }
  return Object.entries(counts).map(([source, count]) => ({ source, count }))
}
