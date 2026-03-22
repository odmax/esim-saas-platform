import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const plans = [
  { id: 'plan_starter', name: 'Starter', description: 'Individual travelers', price: 9.99, data: '1GB', duration: '7 days', regions: 50, features: ['1GB data', '7-day validity', '50+ countries', 'Email support'], popular: false },
  { id: 'plan_global', name: 'Global', description: 'Frequent travelers', price: 29.99, data: '10GB', duration: '30 days', regions: 140, features: ['10GB data', '30-day validity', '140+ countries', 'Priority support', 'Hotspot sharing'], popular: true },
  { id: 'plan_enterprise', name: 'Enterprise', description: 'Businesses & teams', price: 99.99, data: '50GB', duration: '30 days', regions: 140, features: ['50GB data', '30-day validity', '140+ countries', '24/7 support', 'API access', 'Volume discounts'], popular: false }
]

const regionalPlans = [
  { id: 'reg_eu_5gb', name: 'Europe 5GB', price: 14.99, data: '5GB', days: 15, countries: 27, flag: '🇪🇺' },
  { id: 'reg_asia_10gb', name: 'Asia 10GB', price: 19.99, data: '10GB', days: 15, countries: 15, flag: '🌏' },
  { id: 'reg_usa_10gb', name: 'USA 10GB', price: 24.99, data: '10GB', days: 30, countries: 1, flag: '🇺🇸' },
  { id: 'reg_latam_3gb', name: 'Latin America 3GB', price: 12.99, data: '3GB', days: 10, countries: 20, flag: '🌎' },
  { id: 'reg_me_5gb', name: 'Middle East 5GB', price: 16.99, data: '5GB', days: 14, countries: 12, flag: '🏜️' },
  { id: 'reg_africa_2gb', name: 'Africa 2GB', price: 9.99, data: '2GB', days: 7, countries: 25, flag: '🌍' },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ plans, regionalPlans })
  } catch (error) {
    console.error('Plans fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}
