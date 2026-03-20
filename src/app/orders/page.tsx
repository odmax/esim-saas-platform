'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Eye, RefreshCw, Smartphone, TrendingUp, DollarSign, AlertCircle, Loader2, Plus, X } from 'lucide-react'

interface Order {
  id: string
  customer: string
  email: string
  plan: string
  amount: number
  status: string
  date: string
  esims: number
}

interface OrderStats {
  total: number
  revenue: number
  avgOrderValue: number
  failed: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newOrder, setNewOrder] = useState({ customer: '', email: '', plan: 'Global 10GB', esims: 1 })

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      })
      
      if (!res.ok) throw new Error('Failed to create order')
      
      const data = await res.json()
      if (data.success) {
        setOrders(prev => [data.order, ...prev])
        setShowCreateModal(false)
        setNewOrder({ customer: '', email: '', plan: 'Global 10GB', esims: 1 })
        await fetchOrders()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setCreating(false)
    }
  }

  const statusConfig: Record<string, 'success' | 'default' | 'warning' | 'destructive'> = {
    Completed: 'success',
    Processing: 'default',
    Pending: 'warning',
    Failed: 'destructive'
  }

  const plans = ['Global 10GB', 'Europe 5GB', 'Asia 20GB', 'Global 50GB', 'USA 10GB', 'Asia 5GB', 'Europe 10GB', 'Global 20GB']

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-slate-900">Orders</h1><p className="text-xs text-slate-500">Manage and track all eSIM orders</p></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8"><Download className="h-3 w-3" />Export</Button>
            <Button size="sm" className="gap-1 text-xs h-8" onClick={() => setShowCreateModal(true)}><Plus className="h-3 w-3" />New Order</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          <Card className="w-full">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <Smartphone className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium text-emerald-600">+12%</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{stats?.total.toLocaleString() || orders.length}</p>
              <p className="text-xs text-slate-500">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">+8%</span>
              </div>
              <p className="text-lg font-bold text-slate-900">${stats?.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</p>
              <p className="text-xs text-slate-500">Revenue</p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                <span className="text-xs font-medium text-slate-500">-2%</span>
              </div>
              <p className="text-lg font-bold text-slate-900">${stats?.avgOrderValue.toFixed(2) || '0'}</p>
              <p className="text-xs text-slate-500">Avg. Order</p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-emerald-600">-15%</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{stats?.failed || 0}</p>
              <p className="text-xs text-slate-500">Failed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full flex-1">
          <CardHeader className="py-2 px-3 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-indigo-500" />All Orders</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <Input placeholder="Search..." className="w-40 h-7 pl-7 rounded-lg text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={fetchOrders}><RefreshCw className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50"><TableHead className="text-xs font-semibold">Order ID</TableHead><TableHead className="text-xs font-semibold">Customer</TableHead><TableHead className="text-xs font-semibold">Plan</TableHead><TableHead className="text-xs font-semibold">eSIMs</TableHead><TableHead className="text-xs font-semibold">Amount</TableHead><TableHead className="text-xs font-semibold">Status</TableHead><TableHead className="text-xs font-semibold">Date</TableHead><TableHead className="w-10"></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-medium">{order.id}</TableCell>
                    <TableCell><p className="font-medium text-xs">{order.customer}</p><p className="text-xs text-slate-500">{order.email}</p></TableCell>
                    <TableCell><span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-medium">{order.plan}</span></TableCell>
                    <TableCell className="text-xs">{order.esims}</TableCell>
                    <TableCell className="font-semibold text-xs">${order.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={statusConfig[order.status]} className="text-xs">{order.status}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-500">{order.date}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 rounded"><Eye className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {orders.length} orders</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled className="h-7 text-xs rounded-lg">Prev</Button>
            <Button size="sm" className="h-7 text-xs rounded-lg">1</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">Next</Button>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Create New Order</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateModal(false)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Customer Name</label>
                    <Input required placeholder="TechCorp Inc." value={newOrder.customer} onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                    <Input required type="email" placeholder="orders@techcorp.com" value={newOrder.email} onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Plan</label>
                    <select required className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newOrder.plan} onChange={(e) => setNewOrder({ ...newOrder, plan: e.target.value })}>
                      {plans.map((plan) => (<option key={plan} value={plan}>{plan}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Number of eSIMs</label>
                    <Input required type="number" min="1" placeholder="1" value={newOrder.esims} onChange={(e) => setNewOrder({ ...newOrder, esims: parseInt(e.target.value) || 1 })} className="h-9" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1 h-9" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 h-9" disabled={creating}>
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Order'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
