'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Key, Settings, Menu, X, ChevronRight, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Plans', href: '/plans', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'API Keys', href: '/api-keys', icon: Key },
]

const secondaryNav = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="fixed top-3 left-3 z-50 lg:hidden p-2 bg-slate-800 rounded-xl shadow-lg">
        {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-all duration-300 lg:translate-x-0 lg:static shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-700/50">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-sm">eS</span>
              </div>
              <div><span className="text-lg font-bold text-white">eSIM Hub</span><p className="text-xs text-slate-400">B2B Platform</p></div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</p>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />}
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50'}`}><Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} /></div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
                </Link>
              )
            })}

            <p className="px-3 mt-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />}
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50'}`}><Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} /></div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-slate-700/50">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xs">{getInitials(session?.user?.name)}</span></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-indigo-400 capitalize">{session?.user?.role?.toLowerCase() || 'User'}</p>
                </div>
              </div>
              <button onClick={() => signOut()} className="flex items-center gap-2 w-full mt-3 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
