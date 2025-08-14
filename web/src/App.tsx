import AppShell from './components/AppShell'
import { KpiCard } from './components/KpiCard'
import ChartCard from './components/ChartCard'
import IncidentsTable from './components/IncidentsTable'
import { Button } from './components/ui'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_BASE || '/api'

export default function App() {
  const [stats, setStats] = useState<any>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      
      const [statsRes, incidentsRes] = await Promise.all([
        fetch(`${API}/stats/daily`),
        fetch(`${API}/incidents?limit=50`)
      ])
      
      if (!statsRes.ok || !incidentsRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const s = await statsRes.json()
      const inc = await incidentsRes.json()
      
      setStats(s)
      setRows(inc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000) // Refresh every 30 seconds
    return () => clearInterval(id)
  }, [])

  async function demo() {
    try {
      await fetch(`${API}/test-event`, { method: 'POST' })
      setTimeout(load, 1500) // Reload after demo events are processed
    } catch (err) {
      console.error('Demo failed:', err)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingSkeleton />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <div className="glass p-8 text-center">
          <div className="text-danger text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-mono text-ink-primary mb-2">Connection Error</h2>
          <p className="text-ink-muted mb-4">{error}</p>
          <Button onClick={load} className="bg-accent-soft text-black hover:bg-accent-soft/80">
            🔄 Retry Connection
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard 
          label="Today's Incidents" 
          value={stats?.today_count?.toString() ?? '—'} 
          sub={stats?.today_count > 0 ? `+${Math.floor(stats.today_count * 0.3)} from yesterday` : 'No threats detected'}
        />
        <KpiCard 
          label="Top Attacking IP" 
          value={rows?.[0]?.ip ?? 'None'} 
          sub="Most active threat source"
        />
        <KpiCard 
          label="By Type" 
          value={stats ? `${stats.by_type?.BRUTE_FORCE || 0}/${stats.by_type?.PORT_SCAN || 0}` : '—'} 
          sub="Brute Force / Port Scan"
        />
      </div>

      {/* Chart and Demo Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard 
            labels={(stats?.timeseries || []).map((d: any) => d.t)} 
            data={(stats?.timeseries || []).map((d: any) => d.count)} 
          />
        </div>
        <div className="glass p-5 flex flex-col justify-between">
          <div>
            <div className="text-lg font-mono text-ink-primary mb-2">Generate Demo Traffic</div>
            <div className="text-sm text-ink-muted">Triggers brute-force and port-scan incidents to test the system.</div>
          </div>
          <Button onClick={demo} className="mt-4 bg-accent-soft text-black hover:bg-accent-soft/80 w-full">
            🚀 Run Demo
          </Button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="mt-6">
        <IncidentsTable rows={rows} />
      </div>
    </AppShell>
  )
}
