import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
          console.error('DATABASE_URL not set')
          return null
        }

        let client = null
        
        try {
          const { Pool } = await import('pg')
          
          const pool = new Pool({ 
            connectionString,
            max: 1,
            idleTimeoutMillis: 5000,
            connectionTimeoutMillis: 10000,
            ssl: { rejectUnauthorized: false },
          })

          client = await pool.connect()
          
          const result = await client.query(
            `SELECT id, email, name, password, role FROM users WHERE email = $1`,
            [credentials.email]
          )

          const user = result.rows[0]

          if (!user) {
            client.release()
            await pool.end()
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          client.release()
          await pool.end()

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          if (client) {
            try { client.release() } catch {}
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string || null,
          role: token.role as string
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      }
    }
  }
}
