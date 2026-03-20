import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'

let orders = [
  { id: 'ORD-001', customer: 'TechCorp Inc.', email: 'orders@techcorp.com', plan: 'Global 10GB', amount: 29.99, status: 'Completed', date: '2024-01-15', esims: 5 },
  { id: 'ORD-002', customer: 'Global Travel Ltd', email: 'bulk@globaltravel.com', plan: 'Europe 5GB', amount: 149.90, status: 'Processing', date: '2024-01-14', esims: 10 },
  { id: 'ORD-003', customer: 'Mobile Solutions', email: 'procurement@mobilesol.io', plan: 'Asia 20GB', amount: 499.95, status: 'Completed', date: '2024-01-14', esims: 10 },
  { id: 'ORD-004', customer: 'SkyLink Airways', email: 'crew@skylink.aero', plan: 'Global 50GB', amount: 999.90, status: 'Pending', date: '2024-01-13', esims: 10 },
  { id: 'ORD-005', customer: 'WorldConnect', email: 'ops@worldconnect.net', plan: 'USA 10GB', amount: 124.95, status: 'Completed', date: '2024-01-13', esims: 5 },
  { id: 'ORD-006', customer: 'Pacific Trading', email: 'shipping@pacifictrd.com', plan: 'Asia 5GB', amount: 59.95, status: 'Failed', date: '2024-01-12', esims: 5 },
  { id: 'ORD-007', customer: 'EuroTech GmbH', email: 'it@eurotech.de', plan: 'Europe 10GB', amount: 299.80, status: 'Completed', date: '2024-01-12', esims: 20 },
  { id: 'ORD-008', customer: 'Atlas Logistics', email: 'fleet@atlaslog.com', plan: 'Global 20GB', amount: 399.90, status: 'Processing', date: '2024-01-11', esims: 10 },
]

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  let filtered = orders
  if (search) {
    filtered = filtered.filter(o => 
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    )
  }
  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)
  const avgOrderValue = totalRevenue / orders.length
  const failedCount = orders.filter(o => o.status === 'Failed').length

  return NextResponse.json({
    orders: filtered,
    stats: {
      total: orders.length,
      revenue: totalRevenue,
      avgOrderValue,
      failed: failedCount
    }
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { customer, email, plan, esims } = body

    if (!customer || !email || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planPrices: Record<string, number> = {
      'Global 10GB': 29.99,
      'Europe 5GB': 14.99,
      'Asia 20GB': 49.99,
      'Global 50GB': 99.99,
      'USA 10GB': 24.99,
    }

    const amount = (planPrices[plan] || 29.99) * (esims || 1)
    const newOrder = {
      id: `ORD-${nanoid(6).toUpperCase()}`,
      customer,
      email,
      plan,
      amount,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
      esims: esims || 1
    }

    orders = [newOrder, ...orders]

    return NextResponse.json({ success: true, order: newOrder })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
