import { SeverityBadge } from './ui'
import { GlassCard } from './GlassCard'

export default function IncidentsTable({ rows }: { rows: any[] }) {
  if (!rows || rows.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <div className="text-ink-muted text-sm">No incidents found</div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-mono text-ink-primary">Recent Incidents</h3>
        <p className="text-sm text-ink-muted">Latest security events and threats</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3 text-ink-secondary">
              <th>Time</th>
              <th>IP Address</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10 hover:bg-white/3 transition-colors duration-150">
                <td className="px-4 py-3 text-ink-muted font-mono text-xs">
                  {new Date(r.created_at).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 font-mono text-accent-soft">{r.ip}</td>
                <td className="px-4 py-3 text-ink-primary">{r.type}</td>
                <td className="px-4 py-3">
                  <SeverityBadge level={r.severity} />
                </td>
                <td className="px-4 py-3 font-mono text-ink-secondary">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
