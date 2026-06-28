"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { DailyFindings } from "@/lib/types"

interface Props {
  findings: DailyFindings[]
}

export default function CommitActivity({ findings }: Props) {
  const data = findings.map((f) => ({
    date: f.date.slice(5, 10),
    commits: f.github.reduce((s, g) => s + g.newCommits, 0),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
      <h2 className="text-sm font-medium text-gray-700 mb-4">Commit activity (7d)</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === data.length - 1 ? "#7C3AED" : "#E5E7EB"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
