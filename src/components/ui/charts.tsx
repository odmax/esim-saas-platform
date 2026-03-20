'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 198 },
  { name: 'Mar', revenue: 5000, orders: 300 },
  { name: 'Apr', revenue: 4500, orders: 280 },
  { name: 'May', revenue: 6000, orders: 380 },
  { name: 'Jun', revenue: 5500, orders: 320 },
  { name: 'Jul', revenue: 7000, orders: 420 },
  { name: 'Aug', revenue: 6500, orders: 380 },
  { name: 'Sep', revenue: 8000, orders: 480 },
  { name: 'Oct', revenue: 7500, orders: 450 },
  { name: 'Nov', revenue: 9000, orders: 520 },
  { name: 'Dec', revenue: 10000, orders: 600 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#6366f1" 
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          name="Revenue ($)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OrdersChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="orders" 
          stroke="#10b981" 
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorOrders)" 
          name="Orders"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PieChartComponent() {
  const pieData = [
    { name: 'North America', value: 35, fill: '#6366f1' },
    { name: 'Europe', value: 28, fill: '#10b981' },
    { name: 'Asia Pacific', value: 22, fill: '#f59e0b' },
    { name: 'Latin America', value: 10, fill: '#ec4899' },
    { name: 'Others', value: 5, fill: '#94a3b8' },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={pieData.map(d => ({ name: d.name, value: d.value }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        {pieData.map((entry, index) => (
          <Area
            key={`cell-${index}`}
            type="monotone"
            dataKey="value"
            stackId="1"
            stroke={entry.fill}
            fill={entry.fill}
            fillOpacity={0.8}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
