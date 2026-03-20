import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'

let prismaInstance: any = null

async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

function maskKey(key: string): string {
  const parts = key.split('_')
  if (parts.length >= 3) {
    return `${parts[0]}_${parts[1]}_${'•'.repeat(24)}`
  }
  return `${parts[0]}_${'•'.repeat(24)}`
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prisma = await getPrisma()
    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      keys: keys.map((k: { id: string; name: string; key: string; prefix: string; status: string; createdAt: Date; lastUsed: Date | null }) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        maskedKey: maskKey(k.key),
        status: k.status.toLowerCase(),
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        requests: '0'
      }))
    })
  } catch (error) {
    console.error('API keys fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, environment = 'live' } = body

    if (!name) {
      return NextResponse.json({ error: 'Key name is required' }, { status: 400 })
    }

    const prefix = environment === 'test' ? 'esk_test_' : 'esk_live_'
    const randomPart = nanoid(24)
    const fullKey = `${prefix}${randomPart}`

    const prisma = await getPrisma()
    
    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key: fullKey,
        prefix,
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      key: {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        fullKey: newKey.key,
        maskedKey: maskKey(newKey.key),
        status: newKey.status.toLowerCase(),
        createdAt: newKey.createdAt,
        lastUsed: null as Date | null,
        requests: '0'
      }
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    const prisma = await getPrisma()
    
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id
      }
    })

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    await prisma.apiKey.delete({
      where: { id: keyId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API key deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
