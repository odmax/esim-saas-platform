import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
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
      where: { id: session.user.id }
    })

    if (!user) {
      await prisma.$disconnect()
      await pool.end()
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      await prisma.$disconnect()
      await pool.end()
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    await prisma.$disconnect()
    await pool.end()

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
