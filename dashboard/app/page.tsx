import { getAllFindings, getLatestFindings, getAllRepos } from "@/lib/data"
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

  const totalStars = latest?.github.reduce((s, g) => s + g.stars, 0) ?? 0
  const totalStarsDelta = latest?.github.reduce((s, g) => s + g.starsDelta, 0) ?? 0
  const totalNewReleases = latest?.github.reduce((s, g) => s + g.newReleases.length, 0) ?? 0
  const totalNewsItems = latest?.news.reduce((s, n) => s + n.newItems.length, 0) ?? 0

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Orbita</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Daily tracking of the Hermes Agent ecosystem and competitors
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Updated daily
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

        <RepoCards findings={latest?.github ?? []} />

        <NewsFeed findings={latest?.news ?? []} allFindings={allFindings.slice(-7)} />
      </div>
    </main>
  )
}
