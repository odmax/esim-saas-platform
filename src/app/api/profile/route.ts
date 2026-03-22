import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { Pool } = await import('pg')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { PrismaClient } = await import('@prisma/client')

    const pool = new Pool({ 
      connectionString,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    await prisma.$disconnect()
    await pool.end()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { Pool } = await import('pg')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { PrismaClient } = await import('@prisma/client')

    const pool = new Pool({ 
      connectionString,
      max: 1,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.user.id }
      }
    })

    if (existingUser) {
      await prisma.$disconnect()
      await pool.end()
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    await prisma.$disconnect()
    await pool.end()

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
