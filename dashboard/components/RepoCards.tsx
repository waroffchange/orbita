import type { RepoFinding } from "@/lib/types"

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

function Delta({ n }: { n: number }) {
  if (n === 0) return null
  return (
    <span className={n > 0 ? "text-green-600" : "text-red-500"}>
      {n > 0 ? "+" : ""}{fmt(n)}
    </span>
  )
}

export default function RepoCards({ findings }: { findings: RepoFinding[] }) {
  if (findings.length === 0) return null
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-700 mb-3">Repositories</h2>
      <div className="grid grid-cols-2 gap-4">
        {findings.map((g) => (
          <div key={g.repo} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{g.repo}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>
                ⭐ <span className="text-gray-900 font-medium">{fmt(g.stars)}</span>{" "}
                <Delta n={g.starsDelta} />
              </span>
              <span>
                🍴 <span className="text-gray-900 font-medium">{fmt(g.forks)}</span>{" "}
                <Delta n={g.forksDelta} />
              </span>
            </div>
            {g.newReleases.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {g.newReleases.map((r) => (
                  <span key={r} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            )}
            {g.latestCommitMsg && (
              <p className="mt-2 text-xs text-gray-400 truncate">
                Latest: {g.latestCommitMsg}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
