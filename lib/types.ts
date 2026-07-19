export interface RepoSnapshot {
  date: string
  stars: number
  forks: number
  issues: number
  latestSha: string
  releaseTags: string[]
}

export interface RepoFinding {
  repo: string
  stars: number
  starsDelta: number
  forks: number
  forksDelta: number
  issuesDelta: number
  newCommits: number
  latestCommitMsg: string
  newReleases: string[]
  trendScore?: number
}

export interface NewsItem {
  id: string
  title: string
  link: string
  date: string
}

export interface NewsFinding {
  url: string
  newItems: NewsItem[]
  error?: string
}

export interface DailyFindings {
  date: string
  github: RepoFinding[]
  news: NewsFinding[]
  trending?: TrendingRepo[]
}

export interface TrendingRepo {
  repo: string
  description: string
  starsToday: number
  totalStars: number
  language?: string
}

export interface SpikeAlert {
  repo: string
  starsDelta: number
  avgDelta: number
  multiplier: number
}

export interface RepoScore {
  repo: string
  growthScore: number
  activityScore: number
  releaseScore: number
  overallScore: number
}

export interface RepoHistory {
  repo: string
  history: { date: string; stars: number; forks: number }[]
}
