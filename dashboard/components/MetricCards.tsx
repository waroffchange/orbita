interface Props {
  totalStars: number
  starsDelta: number
  newReleases: number
  newsItems: number
  trackedRepos: number
  daysTracked: number
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

export default function MetricCards({ totalStars, starsDelta, newReleases, newsItems, trackedRepos, daysTracked }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Total stars tracked</p>
        <p className="text-2xl font-medium text-gray-900">{fmt(totalStars)}</p>
        <p className={`text-xs mt-1 ${starsDelta >= 0 ? "text-green-600" : "text-red-500"}`}>
          {starsDelta >= 0 ? "+" : ""}{fmt(starsDelta)} today
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">New releases</p>
        <p className="text-2xl font-medium text-gray-900">{newReleases}</p>
        <p className="text-xs mt-1 text-gray-400">since last check</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">News articles</p>
        <p className="text-2xl font-medium text-gray-900">{newsItems}</p>
        <p className="text-xs mt-1 text-gray-400">since last check</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-1">Tracked repos</p>
        <p className="text-2xl font-medium text-gray-900">{trackedRepos}</p>
        <p className="text-xs mt-1 text-gray-400">{daysTracked} days of data</p>
      </div>
    </div>
  )
}
