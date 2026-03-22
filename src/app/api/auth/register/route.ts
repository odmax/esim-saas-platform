import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL not set')
  const pool = new Pool({ 
    connectionString,
    max: 1,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    try {
      const prisma = getPrisma()
      
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        await prisma.$disconnect()
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })

      await prisma.$disconnect()
      return NextResponse.json({ success: true, user }, { status: 201 })
    } catch (dbError) {
      console.error('Database error during registration:', dbError)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
