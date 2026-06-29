import { getAllFindings, getLatestFindings, getAllRepos, computeTrendScores } from "@/lib/data"
import Link from "next/link"
import MetricCards from "@/components/MetricCards"
import StarChart from "@/components/StarChart"
import RepoCards from "@/components/RepoCards"
import NewsFeed from "@/components/NewsFeed"
import CommitActivity from "@/components/CommitActivity"

export const revalidate = 3600

export default function Home() {
  const latest = getLatestFindings()
  const allFindings = getAllFindings()
  const repos = getAllRepos()
  const trendScores = computeTrendScores(allFindings)
  const findingsWithTrend = (latest?.github ?? []).map((g) => ({
    ...g,
    trendScore: trendScores[g.repo] ?? 0,
  }))

  const totalStars = latest?.github.reduce((s, g) => s + g.stars, 0) ?? 0
  const totalStarsDelta = latest?.github.reduce((s, g) => s + g.starsDelta, 0) ?? 0
  const totalNewReleases = latest?.github.reduce((s, g) => s + g.newReleases.length, 0) ?? 0
  const totalNewsItems = latest?.news.reduce((s, n) => s + n.newItems.length, 0) ?? 0

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#111118] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-white">Orbita</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Daily tracking of the Hermes Agent ecosystem and competitors
            </p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1">
              <Link href="/" className="text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">Dashboard</Link>
              <Link href="/weekly" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Weekly</Link>
              <Link href="/manage" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Manage</Link>
            </nav>
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Updated daily
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <MetricCards
          totalStars={totalStars}
          starsDelta={totalStarsDelta}
          newReleases={totalNewReleases}
          newsItems={totalNewsItems}
          trackedRepos={repos.length}
          daysTracked={allFindings.length}
        />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <StarChart findings={allFindings} repos={repos} />
          </div>
          <div>
            <CommitActivity findings={allFindings.slice(-7)} />
          </div>
        </div>

        <RepoCards findings={findingsWithTrend} />

        <NewsFeed findings={latest?.news ?? []} allFindings={allFindings.slice(-7)} />
      </div>
    </main>
  )
}
