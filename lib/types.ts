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
}

export interface RepoHistory {
  repo: string
  history: { date: string; stars: number; forks: number }[]
}
