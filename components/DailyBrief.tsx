interface Props {
  brief: string
  date: string
}

export default function DailyBrief({ brief, date }: Props) {
  if (!brief) return null
  return (
    <div className="bg-[#111118] rounded-xl border border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-400 text-sm font-medium">AI Brief</span>
        <span className="text-gray-600 text-xs">{date}</span>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{brief}</p>
    </div>
  )
}
