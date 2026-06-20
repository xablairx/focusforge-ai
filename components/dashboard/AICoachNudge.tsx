export default function AICoachNudge({ note }: { note: string }) {
  return (
    <div className="mx-4 mt-5 border border-[#1e1e1e] rounded-xl p-4 bg-[#111]">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#f97316] mb-2">Chief of Staff</p>
      <p className="text-sm text-[#a1a1aa] leading-relaxed">{note}</p>
    </div>
  )
}
