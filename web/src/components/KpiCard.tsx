import { GlassCard } from './GlassCard'

export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <GlassCard className="w-full">
      <div className="text-sm text-ink-secondary">{label}</div>
      <div className="mt-1 font-mono text-3xl text-ink-primary">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-muted">{sub}</div>}
    </GlassCard>
  )
}
