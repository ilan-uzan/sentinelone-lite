export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass ${className} p-5`}>{children}</div>
}
