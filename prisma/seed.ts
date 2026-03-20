import pg from 'pg'

const { Pool } = pg

async function main() {
  console.log('Seeding database...')

  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'esim_hub',
    user: 'postgres',
    password: '0000'
  })

  const client = await pool.connect()

  try {
    const plans = [
      { name: 'Starter', slug: 'starter', description: 'Individual travelers', price: 9.99, data: '1GB', duration: '7', regions: 50, popular: false },
      { name: 'Global', slug: 'global', description: 'Frequent travelers', price: 29.99, data: '10GB', duration: '30', regions: 140, popular: true },
      { name: 'Enterprise', slug: 'enterprise', description: 'Businesses & teams', price: 99.99, data: '50GB', duration: '30', regions: 140, popular: false },
    ]

    for (const plan of plans) {
      await client.query(`
        INSERT INTO plans (id, name, slug, description, price, data, duration, regions, features, popular, "isRegional", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, false, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [plan.name, plan.slug, plan.description, plan.price, plan.data, plan.duration, plan.regions, '{}', plan.popular])
    }
    console.log('Created plans')

    const regionalPlans = [
      ['Europe 5GB', 'europe-5gb', 14.99, '5GB', '15', 27, '🇪🇺'],
      ['Asia 10GB', 'asia-10gb', 19.99, '10GB', '15', 15, '🌏'],
      ['USA 10GB', 'usa-10gb', 24.99, '10GB', '30', 1, '🇺🇸'],
      ['Latin America 3GB', 'latam-3gb', 12.99, '3GB', '10', 20, '🌎'],
      ['Middle East 5GB', 'me-5gb', 16.99, '5GB', '14', 12, '🏜️'],
      ['Africa 2GB', 'africa-2gb', 9.99, '2GB', '7', 25, '🌍'],
    ]

    for (const plan of regionalPlans) {
      await client.query(`
        INSERT INTO plans (id, name, slug, price, data, duration, regions, features, popular, "isRegional", flag, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, '{}', false, true, $7, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, plan)
    }
    console.log('Created regional plans')

    console.log('Seeding completed!')
  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
