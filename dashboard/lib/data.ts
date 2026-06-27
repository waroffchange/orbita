import fs from "fs"
import path from "path"
import type { DailyFindings, RepoHistory } from "./types"

const FINDINGS_DIR = path.join(process.cwd(), "data", "findings")
const SNAPSHOTS_DIR = path.join(process.cwd(), "data", "snapshots")

export function getAllFindings(): DailyFindings[] {
  if (!fs.existsSync(FINDINGS_DIR)) return []
  return fs
    .readdirSync(FINDINGS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(FINDINGS_DIR, f), "utf-8")))
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
