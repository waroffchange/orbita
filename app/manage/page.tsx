"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface GithubTarget { repo: string; added: string; last_checked: null; snapshot: object }
interface NewsTarget { url: string; type: string; added: string; last_checked: null; last_seen_ids: string[] }
interface Targets { github: GithubTarget[]; news: NewsTarget[] }

export default function ManagePage() {
  const [targets, setTargets] = useState<Targets | null>(null)
  const [newRepo, setNewRepo] = useState("")
  const [newNewsUrl, setNewNewsUrl] = useState("")
  const [newNewsType, setNewNewsType] = useState<"rss" | "html">("rss")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [isProd, setIsProd] = useState(false)

  useEffect(() => {
    fetch("/api/targets")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setIsProd(true); setTargets({ github: [], news: [] }) }
        else setTargets(data)
      })
  }, [])

  async function save(updated: Targets) {
    setSaving(true)
    setMsg(null)
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) setMsg({ text: "Saved! Push to GitHub and the next run will pick it up.", ok: true })
    else setMsg({ text: data.error ?? "Failed to save.", ok: false })
  }

  function removeRepo(repo: string) {
    if (!targets) return
    const updated = { ...targets, github: targets.github.filter((g) => g.repo !== repo) }
    setTargets(updated)
    save(updated)
  }

  function removeNews(url: string) {
    if (!targets) return
    const updated = { ...targets, news: targets.news.filter((n) => n.url !== url) }
    setTargets(updated)
    save(updated)
  }

  function addRepo() {
    if (!targets || !newRepo.trim()) return
    const repo = newRepo.trim()
    if (targets.github.find((g) => g.repo === repo)) return
    const updated = {
      ...targets,
      github: [...targets.github, { repo, added: new Date().toISOString().slice(0, 10), last_checked: null, snapshot: {} }],
    }
    setTargets(updated)
    setNewRepo("")
    save(updated)
  }

  function addNews() {
    if (!targets || !newNewsUrl.trim()) return
    const url = newNewsUrl.trim()
    if (targets.news.find((n) => n.url === url)) return
    const updated = {
      ...targets,
      news: [...targets.news, { url, type: newNewsType, added: new Date().toISOString().slice(0, 10), last_checked: null, last_seen_ids: [] }],
    }
    setTargets(updated)
    setNewNewsUrl("")
    save(updated)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#111118] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-white">Orbita</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage targets</p>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Dashboard</Link>
            <Link href="/weekly" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Weekly</Link>
            <Link href="/manage" className="text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">Manage</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {isProd && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-400">
            Running in production — changes are read-only here. Edit <code className="bg-white/10 px-1 rounded">hermes/competitive-intel/templates/targets.json</code> locally and push to GitHub.
          </div>
        )}

        {msg && (
          <div className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {msg.text}
          </div>
        )}

        {/* GitHub repos */}
        <div className="bg-[#111118] rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-medium text-gray-300">Tracked repositories</h3>
          </div>
          <div className="divide-y divide-white/5">
            {targets?.github.map((g) => (
              <div key={g.repo} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <span className="text-sm text-white">{g.repo}</span>
                  <span className="text-xs text-gray-600">added {g.added}</span>
                </div>
                {!isProd && (
                  <button
                    onClick={() => removeRepo(g.repo)}
                    className="text-xs text-red-500/70 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isProd && (
            <div className="px-4 py-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRepo()}
                placeholder="owner/repo"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={addRepo}
                disabled={saving || !newRepo.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* News sources */}
        <div className="bg-[#111118] rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-medium text-gray-300">News sources</h3>
          </div>
          <div className="divide-y divide-white/5">
            {targets?.news.map((n) => (
              <div key={n.url} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{n.type}</span>
                  <span className="text-sm text-white">{n.url}</span>
                </div>
                {!isProd && (
                  <button
                    onClick={() => removeNews(n.url)}
                    className="text-xs text-red-500/70 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isProd && (
            <div className="px-4 py-3 border-t border-white/5 flex gap-2">
              <select
                value={newNewsType}
                onChange={(e) => setNewNewsType(e.target.value as "rss" | "html")}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="rss">RSS</option>
                <option value="html">HTML</option>
              </select>
              <input
                type="text"
                value={newNewsUrl}
                onChange={(e) => setNewNewsUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNews()}
                placeholder="https://example.com/feed.xml"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={addNews}
                disabled={saving || !newNewsUrl.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
