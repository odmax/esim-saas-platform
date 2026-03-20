'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Smartphone, ShoppingCart, DollarSign, Globe, TrendingUp, Activity, Sparkles, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Stats {
  totalEsims: { value: number; change: number; trend: string }
  activeOrders: { value: number; change: number; trend: string }
  revenue: { value: number; change: number; trend: string }
  countries: { value: number; change: number; trend: string }
  topRegions: Array<{ region: string; percent: number }>
  popularPlans: Array<{ name: string; sales: number; revenue: number }>
  recentOrders: Array<{ id: string; customer: string; plan: string; amount: number; status: string }>
  monthlySales: number[]
}

const defaultStats: Stats = {
  totalEsims: { value: 0, change: 0, trend: 'up' },
  activeOrders: { value: 0, change: 0, trend: 'up' },
  revenue: { value: 0, change: 0, trend: 'up' },
  countries: { value: 0, change: 0, trend: 'up' },
  topRegions: [],
  popularPlans: [],
  recentOrders: [],
  monthlySales: []
}

const revenueData = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
]

const ordersData = [
  { name: 'Mon', orders: 240 }, { name: 'Tue', orders: 198 }, { name: 'Wed', orders: 320 },
  { name: 'Thu', orders: 280 }, { name: 'Fri', orders: 380 }, { name: 'Sat', orders: 150 }, { name: 'Sun', orders: 120 },
]

const regionColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8']

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalEsims: data.totalEsims || defaultStats.totalEsims,
            activeOrders: data.activeOrders || defaultStats.activeOrders,
            revenue: data.revenue || defaultStats.revenue,
            countries: data.countries || defaultStats.countries,
            topRegions: data.topRegions || defaultStats.topRegions,
            popularPlans: data.popularPlans || defaultStats.popularPlans,
            recentOrders: data.recentOrders || defaultStats.recentOrders,
            monthlySales: data.monthlySales || defaultStats.monthlySales
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  if (status === 'loading' || (loading && status === 'authenticated')) {
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

  const statCards = [
    { title: 'Total eSIMs', value: stats.totalEsims.value, change: `${stats.totalEsims.change > 0 ? '+' : ''}${stats.totalEsims.change}%`, trend: stats.totalEsims.trend, icon: Smartphone, color: 'indigo' },
    { title: 'Active Orders', value: stats.activeOrders.value, change: `${stats.activeOrders.change > 0 ? '+' : ''}${stats.activeOrders.change}%`, trend: stats.activeOrders.trend, icon: ShoppingCart, color: 'emerald' },
    { title: 'Revenue', value: `$${stats.revenue.value.toLocaleString()}`, change: `${stats.revenue.change > 0 ? '+' : ''}${stats.revenue.change}%`, trend: stats.revenue.trend, icon: DollarSign, color: 'violet' },
    { title: 'Countries', value: stats.countries.value, change: `${stats.countries.change > 0 ? '+' : ''}${stats.countries.change}%`, trend: stats.countries.trend, icon: Globe, color: 'amber' },
  ]

  const chartData = stats.monthlySales.map((value, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] || `M${i + 1}`,
    revenue: value
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {session?.user?.name}!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Activity className="h-3.5 w-3.5" />Reports</Button>
            <Button size="sm" className="gap-1.5" onClick={() => router.push('/orders?new=true')}><Sparkles className="h-3.5 w-3.5" />New Order</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-${stat.color}-50`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                <p className="text-xs text-slate-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData.length > 0 ? chartData : revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Orders by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={ordersData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topRegions.length > 0 ? stats.topRegions.map((region, i) => (
                  <div key={region.region} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{region.region}</span>
                      <span className="font-medium">{region.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${region.percent * 2}%`, backgroundColor: regionColors[i] || '#94a3b8' }} />
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-500" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.amount}</p>
                      <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Processing' ? 'default' : 'warning'} className="text-xs">{order.status}</Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Popular Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.popularPlans.length > 0 ? stats.popularPlans.map((plan, i) => (
                  <div key={plan.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <span className="text-lg font-bold text-slate-200 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{plan.name}</p>
                      <p className="text-xs text-slate-500">{plan.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${plan.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
