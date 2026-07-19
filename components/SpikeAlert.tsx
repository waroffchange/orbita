import type { SpikeAlert } from "@/lib/types"

export default function SpikeAlerts({ alerts }: { alerts: SpikeAlert[] }) {
  if (alerts.length === 0) return null
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.repo}
          className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
        >
          <span className="text-red-400 text-lg">⚡</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-red-300">{a.repo.split("/")[1]}</span>
            <span className="text-sm text-gray-400 ml-2">
              +{a.starsDelta.toLocaleString()} stars today
            </span>
            {a.avgDelta > 0 && (
              <span className="text-xs text-gray-600 ml-2">
                (avg {a.avgDelta}/day)
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-red-400 whitespace-nowrap">
            {a.multiplier}x spike
          </span>
        </div>
      ))}
    </div>
  )
}
