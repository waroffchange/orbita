import { getWeeklySummary } from "@/lib/data"
import Link from "next/link"

export const revalidate = 3600

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

function sourceLabel(url: string) {
  try { return new URL(url).hostname.replace("www.", "") } catch { return url }
}

export default function WeeklyPage() {
  const summary = getWeeklySummary()

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#111118] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-white">Orbita</h1>
            <p className="text-sm text-gray-500 mt-0.5">Weekly summary</p>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Dashboard</Link>
            <Link href="/weekly" className="text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">Weekly</Link>
            <Link href="/manage" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Manage</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {!summary ? (
          <div className="bg-[#111118] rounded-xl border border-white/10 p-12 text-center text-gray-600">
            No data yet — run check.py to populate
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-medium">7-day report</h2>
              <span className="text-sm text-gray-500">{summary.from} → {summary.to} ({summary.days} days)</span>
            </div>

            {/* Repo table */}
            <div className="bg-[#111118] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-medium text-gray-400">GitHub repositories</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">Repo</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-600 font-medium">Stars delta</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-600 font-medium">Commits</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-600 font-medium">Releases</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.repos
                    .sort((a, b) => b.starsDelta - a.starsDelta)
                    .map((r) => (
                      <tr key={r.repo} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-medium">{r.repo}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={r.starsDelta > 0 ? "text-green-500" : r.starsDelta < 0 ? "text-red-500" : "text-gray-600"}>
                            {r.starsDelta > 0 ? "+" : ""}{fmt(r.starsDelta)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">{r.commits}</td>
                        <td className="px-4 py-3 text-right">
                          {r.releases.length > 0 ? (
                            <span className="text-purple-400">{r.releases.length} new</span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* News sources */}
            <div className="bg-[#111118] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-sm font-medium text-gray-400">News sources</h3>
              </div>
              <div className="divide-y divide-white/5">
                {summary.news
                  .sort((a, b) => b.count - a.count)
                  .map((n) => (
                    <div key={n.url} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-300">{sourceLabel(n.url)}</span>
                      <span className="text-sm text-purple-400 font-medium">{n.count} articles</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
