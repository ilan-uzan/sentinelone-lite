export function Button({ children, onClick, className = '', ...props }: any) {
  return (
    <button
      onClick={onClick}
      className={`focus-glow font-mono px-4 py-2 rounded-glass border border-white/15 bg-black/30 hover:bg-white/5 text-ink-primary transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SeverityBadge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const map = {
    LOW: 'border-white/20 text-ink-secondary',
    MEDIUM: 'border-[rgba(255,193,77,0.5)] text-[#FFC14D]',
    HIGH: 'border-[rgba(255,77,109,0.5)] text-[#FF4D6D]'
  }
  return (
    <span className={`font-mono text-xs px-2 py-1 rounded-md border ${map[level]}`}>
      {level}
    </span>
  )
}
