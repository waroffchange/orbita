import type { TrendingRepo } from "@/lib/types"

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

const LANG_COLORS: Record<string, string> = {
  Python: "bg-blue-500/20 text-blue-300",
  TypeScript: "bg-cyan-500/20 text-cyan-300",
  JavaScript: "bg-yellow-500/20 text-yellow-300",
  Rust: "bg-orange-500/20 text-orange-300",
  Go: "bg-teal-500/20 text-teal-300",
}

export default function TrendingFeed({ repos }: { repos: TrendingRepo[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-400 mb-3">Trending AI repos</h2>
      {repos.length === 0 ? (
        <div className="bg-[#111118] rounded-xl border border-white/10 p-8 text-center text-sm text-gray-600">
          No trending data yet — run check.py to populate
        </div>
      ) : (
        <div className="bg-[#111118] rounded-xl border border-white/10 divide-y divide-white/5">
          {repos.map((r) => {
            const langColor = LANG_COLORS[r.language ?? ""] ?? "bg-white/10 text-gray-400"
            return (
              <div key={r.repo} className="flex items-start gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`https://github.com/${r.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-200 hover:text-purple-400 transition-colors"
                    >
                      {r.repo}
                    </a>
                    {r.language && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${langColor}`}>
                        {r.language}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{r.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <span>⭐</span>
                  <span className="text-white font-medium">{fmt(r.totalStars)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
