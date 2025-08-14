import { GlassCard } from './GlassCard'

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="w-full">
            <div className="skeleton h-4 w-20 mb-2 rounded"></div>
            <div className="skeleton h-8 w-16 mb-2 rounded"></div>
            <div className="skeleton h-3 w-24 rounded"></div>
          </GlassCard>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard className="p-5">
            <div className="skeleton h-6 w-32 mb-4 rounded"></div>
            <div className="skeleton h-4 w-48 mb-6 rounded"></div>
            <div className="skeleton h-64 w-full rounded"></div>
          </GlassCard>
        </div>
        <div className="glass p-5">
          <div className="skeleton h-6 w-40 mb-2 rounded"></div>
          <div className="skeleton h-4 w-48 mb-4 rounded"></div>
          <div className="skeleton h-10 w-24 rounded"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <GlassCard className="overflow-hidden">
        <div className="skeleton h-6 w-32 mb-4 rounded"></div>
        <div className="skeleton h-4 w-48 mb-6 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="skeleton h-4 w-20 rounded"></div>
              <div className="skeleton h-4 w-24 rounded"></div>
              <div className="skeleton h-4 w-16 rounded"></div>
              <div className="skeleton h-4 w-12 rounded"></div>
              <div className="skeleton h-4 w-8 rounded"></div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
