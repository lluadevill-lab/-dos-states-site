import { Plane } from 'lucide-react'

export default function FlightPath() {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted">
      <span className="stamp-badge">EUA</span>
      <svg viewBox="0 0 160 16" className="w-24 md:w-32 h-4 text-ink/30 overflow-visible" aria-hidden="true">
        <line
          x1="0" y1="8" x2="160" y2="8"
          stroke="currentColor" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round"
          className="animate-dash"
        />
      </svg>
      <Plane size={16} className="text-stamp -rotate-0" strokeWidth={2} />
      <svg viewBox="0 0 160 16" className="w-24 md:w-32 h-4 text-ink/30 overflow-visible" aria-hidden="true">
        <line
          x1="0" y1="8" x2="160" y2="8"
          stroke="currentColor" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round"
          className="animate-dash"
        />
      </svg>
      <span className="stamp-badge">BR</span>
    </div>
  )
}
