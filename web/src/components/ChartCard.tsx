import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { GlassCard } from './GlassCard'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

export default function ChartCard({ labels, data }: { labels: string[]; data: number[] }) {
  const cfg = {
    labels,
    datasets: [{
      label: 'Incidents',
      data,
      fill: true,
      borderWidth: 2,
      borderColor: 'rgba(57,255,20,0.9)',
      backgroundColor: 'rgba(57,255,20,0.12)',
      pointRadius: 0,
      tension: 0.35
    }]
  }
  
  const opts = {
    responsive: true,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        mode: 'index' as const, 
        intersect: false,
        backgroundColor: 'rgba(15,23,20,0.95)',
        titleColor: '#D8FFEA',
        bodyColor: '#98E6C2',
        borderColor: 'rgba(207,255,241,0.3)',
        borderWidth: 1
      } 
    },
    scales: {
      x: { 
        ticks: { color: '#98E6C2' }, 
        grid: { color: 'rgba(255,255,255,0.06)' } 
      },
      y: { 
        ticks: { color: '#98E6C2' }, 
        grid: { color: 'rgba(255,255,255,0.06)' } 
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }
  
  return (
    <GlassCard className="p-5">
      <div className="mb-4">
        <h3 className="text-lg font-mono text-ink-primary">Incidents Timeline</h3>
        <p className="text-sm text-ink-muted">Last 24 hours activity</p>
      </div>
      <Line data={cfg} options={opts} />
    </GlassCard>
  )
}
