"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { DailyFindings } from "@/lib/types"

const COLORS = ["#7C3AED", "#2563EB", "#16A34A", "#EA580C", "#DB2777"]

interface Props {
  findings: DailyFindings[]
  repos: string[]
}

export default function StarChart({ findings, repos }: Props) {
  const data = findings.map((f) => {
    const row: Record<string, string | number> = { date: f.date.slice(0, 10) }
    for (const g of f.github) {
      row[g.repo] = g.stars
    }
    return row
  })

  const shortName = (repo: string) => repo.split("/")[1]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-medium text-gray-700 mb-4">Star growth</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          No data yet — run check.py to populate
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString() : v} />
            <Legend formatter={shortName} />
            {repos.map((repo, i) => (
              <Line
                key={repo}
                type="monotone"
                dataKey={repo}
                name={repo}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
