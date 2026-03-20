'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { User, Mail, Calendar, Shield, Key, Activity, TrendingUp, Smartphone, Globe, Loader2 } from 'lucide-react'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Stats {
  apiRequests: number
  successRate: number
  esims: number
  countries: number
}

interface RecentActivity {
  id: string
  action: string
  time: string
  type: string
}

const apiUsageData = [
  { month: 'Jan', requests: 1200, errors: 12 },
  { month: 'Feb', requests: 1900, errors: 18 },
  { month: 'Mar', requests: 2400, errors: 15 },
  { month: 'Apr', requests: 2100, errors: 22 },
  { month: 'May', requests: 3200, errors: 28 },
  { month: 'Jun', requests: 3800, errors: 25 },
]

const mockActivity: RecentActivity[] = [
  { id: '1', action: 'Logged in', time: 'Just now', type: 'profile' },
  { id: '2', action: 'Viewed dashboard', time: '5 minutes ago', type: 'profile' },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats>({
    apiRequests: 14600,
    successRate: 98.5,
    esims: 2847,
    countries: 142
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const displayName = profile?.name || session?.user?.name || 'User'
  const displayEmail = profile?.email || session?.user?.email || ''
  const displayRole = profile?.role || session?.user?.role || 'USER'
  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500">Manage your account and view usage</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                <p className="text-sm text-slate-500">{displayEmail}</p>
                <Badge variant={displayRole === 'ADMIN' ? 'default' : 'secondary'} className="mt-2 capitalize">
                  {displayRole.toLowerCase()}
                </Badge>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{displayName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{displayEmail}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Joined {joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg"><Activity className="h-4 w-4 text-indigo-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{stats.apiRequests.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">API Requests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{stats.successRate}%</p>
                      <p className="text-xs text-slate-500">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg"><Smartphone className="h-4 w-4 text-amber-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{stats.esims.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">eSIMs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg"><Globe className="h-4 w-4 text-violet-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{stats.countries}</p>
                      <p className="text-xs text-slate-500">Countries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  API Usage Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={apiUsageData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" name="Requests" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'order' ? 'bg-emerald-100' : item.type === 'api' ? 'bg-violet-100' : 'bg-slate-100'}`}>
                          {item.type === 'order' ? <Smartphone className="h-4 w-4 text-emerald-600" /> : 
                           item.type === 'api' ? <Key className="h-4 w-4 text-violet-600" /> : 
                           <User className="h-4 w-4 text-slate-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.action}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
