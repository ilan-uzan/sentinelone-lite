import { PropsWithChildren } from 'react'

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen relative">
      <div className="noise pointer-events-none fixed inset-0" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-mono text-xl text-neon">SentinelOne Lite</h1>
          <div className="text-sm text-ink-secondary">Liquid Glass Hacker UI</div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
