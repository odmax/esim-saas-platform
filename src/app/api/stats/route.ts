import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = {
      totalEsims: { value: 24521, change: 12.5, trend: 'up' },
      activeOrders: { value: 1234, change: 8.2, trend: 'up' },
      revenue: { value: 45231, change: 23.1, trend: 'up' },
      countries: { value: 142, change: -2.3, trend: 'down' },
      topRegions: [
        { region: 'North America', percent: 35 },
        { region: 'Europe', percent: 28 },
        { region: 'Asia Pacific', percent: 22 },
        { region: 'Latin America', percent: 10 },
      ],
      popularPlans: [
        { name: 'Global 10GB', sales: 1245, revenue: 37335 },
        { name: 'Europe 5GB', sales: 892, revenue: 13378 },
        { name: 'Asia 20GB', sales: 654, revenue: 32695 },
        { name: 'USA 10GB', sales: 521, revenue: 13024 },
      ],
      recentOrders: [
        { id: 'ORD-001', customer: 'TechCorp Inc.', plan: 'Global 10GB', amount: 29.99, status: 'Completed' },
        { id: 'ORD-002', customer: 'Global Travel', plan: 'Europe 5GB', amount: 14.99, status: 'Processing' },
        { id: 'ORD-003', customer: 'Mobile Solutions', plan: 'Asia 20GB', amount: 49.99, status: 'Completed' },
        { id: 'ORD-004', customer: 'SkyLink Airways', plan: 'Global 50GB', amount: 99.99, status: 'Pending' },
        { id: 'ORD-005', customer: 'WorldConnect', plan: 'USA 10GB', amount: 24.99, status: 'Completed' },
      ],
      monthlySales: [45, 65, 52, 78, 60, 85, 72, 90, 68, 95, 80, 100]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
