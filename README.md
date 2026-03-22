# eSIM SaaS Platform

A B2B eSIM management platform built with Next.js 14, NextAuth, and Prisma.

## Deployment to Vercel

### Prerequisites

1. **Database**: You need a serverless-compatible PostgreSQL database. Recommended options:
   - [Supabase](https://supabase.com) - Free tier available
   - [Neon](https://neon.tech) - Serverless Postgres
   - [Railway](https://railway.app) - Easy deployment
   - [PlanetScale](https://planetscale.com) - Serverless MySQL alternative

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

### Step 1: Set Up Database

1. Create a PostgreSQL database on your chosen provider
2. Get the connection URL (should look like `postgresql://user:password@host:5432/db`)
3. If using SSL (required for most cloud providers), add `?sslmode=require` to the URL:
   ```
   postgresql://user:password@host:5432/db?sslmode=require
   ```

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. In the Environment Variables section, add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
   | `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |

4. Click Deploy

### Step 3: Set Up Database Schema

After deployment, run Prisma migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push schema to database
npx prisma db push
```

### Step 4: Create Admin User

Connect to your database and create an admin user:

```sql
-- Using psql or any PostgreSQL client
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  'Admin',
  '$2b$12$YOUR_HASH_HERE', -- Use bcrypt to generate
  'ADMIN',
  NOW(),
  NOW()
);
```

Generate password hash:
```bash
node -e "require('bcryptjs').hash('your-password', 12).then(h => console.log(h))"
```

### Troubleshooting

#### "Invalid email or password" on production
1. Check that `NEXTAUTH_URL` matches your Vercel deployment URL exactly (including https://)
2. Ensure `NEXTAUTH_SECRET` is set and is at least 32 characters
3. Verify `DATABASE_URL` is accessible from Vercel's servers and uses SSL if required

#### Database connection errors
1. Make sure your database allows connections from Vercel's IP ranges
2. Check if your database requires SSL - add `?sslmode=require` to the connection string
3. Verify the connection string is correct

#### Session issues
1. Clear browser cookies
2. Check that `NEXTAUTH_URL` is set correctly (no trailing slash)
3. Ensure `NEXTAUTH_SECRET` is the same across deployments

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local database URL

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing (32+ chars) | Yes |
| `NEXTAUTH_URL` | Application URL (for production) | Yes (production) |
