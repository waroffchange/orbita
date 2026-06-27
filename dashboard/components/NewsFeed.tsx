import type { NewsFinding, DailyFindings } from "@/lib/types"

const SOURCE_COLORS: Record<string, string> = {
  "openai.com": "bg-blue-50 text-blue-700",
  "nousresearch.com": "bg-purple-50 text-purple-700",
  "anthropic.com": "bg-green-50 text-green-700",
}

function sourceLabel(url: string) {
  try {
    const host = new URL(url).hostname.replace("www.", "")
    const base = host.split(".").slice(-2).join(".")
    return { label: base, color: SOURCE_COLORS[base] ?? "bg-gray-100 text-gray-600" }
  } catch {
    return { label: url, color: "bg-gray-100 text-gray-600" }
  }
}

interface Props {
  findings: NewsFinding[]
  allFindings: DailyFindings[]
}

export default function NewsFeed({ findings, allFindings }: Props) {
  const items = findings.flatMap((f) =>
    f.newItems.map((item) => ({ ...item, url: f.url }))
  )

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-700 mb-3">Latest news</h2>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          No news items yet
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {items.slice(0, 10).map((item) => {
            const { label, color } = sourceLabel(item.url)
            return (
              <div key={item.id} className="flex items-start gap-3 p-4">
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${color}`}>
                  {label}
                </span>
                <div className="min-w-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 hover:text-purple-700 transition-colors line-clamp-1"
                  >
                    {item.title}
                  </a>
                  {item.date && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.date.slice(0, 16)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
