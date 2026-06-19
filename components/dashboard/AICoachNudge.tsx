export default function AICoachNudge({ note }: { note: string }) {
  return (
    <div className="mx-4 mb-4 bg-black rounded-xl p-3 flex gap-2.5">
      <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center text-sm flex-shrink-0">⚡</div>
      <p className="text-[12px] text-gray-300 leading-relaxed">
        <span className="text-[#f97316] font-bold">Chief of Staff: </span>
        {note}
      </p>
    </div>
  )
}
