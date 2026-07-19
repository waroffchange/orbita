import fs from "fs"
import path from "path"
import type { DailyFindings, RepoHistory, SpikeAlert, RepoScore, TrendingRepo } from "./types"

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
    trending: (raw.trending ?? []).map((t: any) => ({
      repo: t.repo,
      description: t.description ?? "",
      starsToday: t.stars_today ?? t.starsToday ?? 0,
      totalStars: t.total_stars ?? t.totalStars ?? 0,
      language: t.language ?? "",
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

export function computeTrendScores(findings: DailyFindings[]): Record<string, number> {
  const last7 = findings.slice(-7)
  const scores: Record<string, number> = {}
  const repos = last7.flatMap((f) => f.github.map((g) => g.repo))
  const unique = [...new Set(repos)]
  for (const repo of unique) {
    let score = 0
    for (const f of last7) {
      const g = f.github.find((x) => x.repo === repo)
      if (!g) continue
      score += g.starsDelta * 0.5 + g.newCommits * 3 + g.newReleases.length * 10
    }
    scores[repo] = Math.round(score)
  }
  return scores
}

export function getWeeklySummary() {
  const all = getAllFindings()
  const last7 = all.slice(-7)
  if (last7.length === 0) return null

  const repoMap: Record<string, { starsDelta: number; commits: number; releases: string[] }> = {}
  const newsMap: Record<string, number> = {}

  for (const f of last7) {
    for (const g of f.github) {
      if (!repoMap[g.repo]) repoMap[g.repo] = { starsDelta: 0, commits: 0, releases: [] }
      repoMap[g.repo].starsDelta += g.starsDelta
      repoMap[g.repo].commits += g.newCommits
      for (const r of g.newReleases) {
        if (!repoMap[g.repo].releases.includes(r)) repoMap[g.repo].releases.push(r)
      }
    }
    for (const n of f.news) {
      newsMap[n.url] = (newsMap[n.url] ?? 0) + n.newItems.length
    }
  }

  return {
    from: last7[0].date.slice(0, 10),
    to: last7[last7.length - 1].date.slice(0, 10),
    days: last7.length,
    repos: Object.entries(repoMap).map(([repo, data]) => ({ repo, ...data })),
    news: Object.entries(newsMap).map(([url, count]) => ({ url, count })),
  }
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

export function computeSpikes(allFindings: DailyFindings[]): SpikeAlert[] {
  if (allFindings.length < 3) return []
  const latest = allFindings[allFindings.length - 1]
  const history = allFindings.slice(-8, -1)
  const alerts: SpikeAlert[] = []

  for (const g of latest.github) {
    const deltas = history
      .map((f) => f.github.find((r) => r.repo === g.repo)?.starsDelta ?? 0)
      .filter((d) => d >= 0)
    if (deltas.length === 0) continue
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length
    if (avg === 0 && g.starsDelta > 100) {
      alerts.push({ repo: g.repo, starsDelta: g.starsDelta, avgDelta: 0, multiplier: 99 })
    } else if (avg > 0 && g.starsDelta > avg * 3) {
      alerts.push({
        repo: g.repo,
        starsDelta: g.starsDelta,
        avgDelta: Math.round(avg),
        multiplier: Math.round((g.starsDelta / avg) * 10) / 10,
      })
    }
  }
  return alerts.sort((a, b) => b.multiplier - a.multiplier)
}

export function computeRepoScores(allFindings: DailyFindings[]): Record<string, RepoScore> {
  const recent = allFindings.slice(-7)
  if (recent.length === 0) return {}

  const aggStarsDelta: Record<string, number> = {}
  const aggCommits: Record<string, number> = {}
  const aggReleases: Record<string, number> = {}
  const repos = new Set(recent.flatMap((f) => f.github.map((g) => g.repo)))

  for (const f of recent) {
    for (const g of f.github) {
      aggStarsDelta[g.repo] = (aggStarsDelta[g.repo] ?? 0) + Math.max(0, g.starsDelta)
      aggCommits[g.repo] = (aggCommits[g.repo] ?? 0) + g.newCommits
      aggReleases[g.repo] = (aggReleases[g.repo] ?? 0) + g.newReleases.length
    }
  }

  const maxStars = Math.max(...Object.values(aggStarsDelta), 1)
  const maxCommits = Math.max(...Object.values(aggCommits), 1)
  const maxReleases = Math.max(...Object.values(aggReleases), 1)
  const scores: Record<string, RepoScore> = {}

  for (const repo of repos) {
    const growthScore = Math.round(((aggStarsDelta[repo] ?? 0) / maxStars) * 100)
    const activityScore = Math.round(((aggCommits[repo] ?? 0) / maxCommits) * 100)
    const releaseScore = Math.round(((aggReleases[repo] ?? 0) / maxReleases) * 100)
    const overallScore = Math.round(growthScore * 0.4 + activityScore * 0.4 + releaseScore * 0.2)
    scores[repo] = { repo, growthScore, activityScore, releaseScore, overallScore }
  }
  return scores
}

export function generateBrief(allFindings: DailyFindings[]): string {
  if (allFindings.length === 0) return ""
  const latest = allFindings[allFindings.length - 1]
  const spikes = computeSpikes(allFindings)
  const parts: string[] = []

  const topGainer = [...latest.github].sort((a, b) => b.starsDelta - a.starsDelta)[0]
  if (topGainer && topGainer.starsDelta > 0) {
    parts.push(
      `${topGainer.repo.split("/")[1]} led star growth today with +${topGainer.starsDelta.toLocaleString()} stars.`
    )
  }

  if (spikes.length > 0) {
    const s = spikes[0]
    parts.push(`⚡ ${s.repo.split("/")[1]} is spiking at ${s.multiplier}x its 7-day average (+${s.starsDelta} vs avg ${s.avgDelta}/day).`)
  }

  const mostActive = [...latest.github].sort((a, b) => b.newCommits - a.newCommits)[0]
  if (mostActive && mostActive.newCommits > 0) {
    parts.push(`${mostActive.repo.split("/")[1]} saw the most commit activity with ${mostActive.newCommits} new commits.`)
  }

  const withReleases = latest.github.filter((g) => g.newReleases.length > 0)
  if (withReleases.length > 0) {
    const names = withReleases.map((g) => `${g.repo.split("/")[1]} (${g.newReleases[0]})`).join(", ")
    parts.push(`New releases shipped: ${names}.`)
  }

  const totalNews = latest.news.reduce((s, n) => s + n.newItems.length, 0)
  if (totalNews > 0) {
    parts.push(`${totalNews} new articles tracked across monitored sources.`)
  }

  if (parts.length === 0) return "No significant changes detected today."
  return parts.join(" ")
}

export function getTrendingRepos(allFindings: DailyFindings[]): TrendingRepo[] {
  if (allFindings.length === 0) return []
  const latest = allFindings[allFindings.length - 1]
  return (latest.trending ?? []).map((t: any) => ({
    repo: t.repo,
    description: t.description ?? "",
    starsToday: t.stars_today ?? t.starsToday ?? 0,
    totalStars: t.total_stars ?? t.totalStars ?? 0,
    language: t.language ?? "",
  }))
}
