'use client'

import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 w-full lg:overflow-hidden">
        <div className="p-4 lg:p-6 h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
