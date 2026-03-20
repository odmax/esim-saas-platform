'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Input } from '@/components/ui/input'
import { Globe, Zap, Check, Plus, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  data: string
  duration: string
  regions: number
  features: string[]
  popular: boolean
}

interface RegionalPlan {
  id: string
  name: string
  price: number
  data: string
  days: number
  countries: number
  flag: string
}

interface PlansData {
  plans: Plan[]
  regionalPlans: RegionalPlan[]
}

export default function PlansPage() {
  const [data, setData] = useState<PlansData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/plans')
        if (!res.ok) throw new Error('Failed to fetch plans')
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const filteredPlans = data?.plans.filter(plan => 
    plan.name.toLowerCase().includes(search.toLowerCase()) ||
    plan.description.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
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
          <div><h1 className="text-xl font-bold text-slate-900">eSIM Plans</h1><p className="text-xs text-slate-500">Manage your plans and pricing</p></div>
          <Button size="sm" className="gap-1 text-xs h-8"><Plus className="h-3 w-3" />Create Plan</Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search plans..." 
              className="pl-8 h-8 rounded-lg text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">All</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">Popular</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className={`w-full relative ${plan.popular ? 'border-indigo-300 ring-1 ring-indigo-200' : ''}`}>
              {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">Most Popular</div>}
              <CardHeader className="pt-5 pb-2"><CardTitle className="text-base">{plan.name}</CardTitle><CardDescription>{plan.description}</CardDescription></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">${plan.price}<span className="text-xs font-normal text-slate-500">/plan</span></p>
                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="text-center p-1.5 bg-slate-50 rounded-lg"><p className="font-bold text-xs">{plan.data}</p><p className="text-xs text-slate-500">Data</p></div>
                  <div className="text-center p-1.5 bg-slate-50 rounded-lg"><p className="font-bold text-xs">{plan.duration}</p><p className="text-xs text-slate-500">Valid</p></div>
                  <div className="text-center p-1.5 bg-slate-50 rounded-lg"><p className="font-bold text-xs">{plan.regions}+</p><p className="text-xs text-slate-500">Countries</p></div>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (<li key={feature} className="flex items-center gap-1.5 text-xs text-slate-600"><Check className="h-3 w-3 text-emerald-500" />{feature}</li>))}
                </ul>
              </CardContent>
              <CardFooter><Button className="w-full text-xs h-8">Choose Plan</Button></CardFooter>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" />Regional Plans</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
            {data?.regionalPlans.map((plan) => (
              <Card key={plan.id} className="w-full hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{plan.flag}</span>
                    <p className="font-bold text-sm">${plan.price}</p>
                  </div>
                  <p className="font-medium text-xs mb-1">{plan.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-0.5"><Zap className="h-2.5 w-2.5 text-indigo-500" />{plan.data}</span>
                    <span>{plan.days}d</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
