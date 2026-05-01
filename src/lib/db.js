import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        city TEXT NOT NULL,
        price NUMERIC NOT NULL,
        image_url TEXT,
        airbnb_ical_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        uid TEXT UNIQUE,
        guest_name TEXT NOT NULL,
        email TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // SEEDING: Create a default property if none exist
    const checkProps = await client.query('SELECT id FROM properties LIMIT 1');
    if (checkProps.rows.length === 0) {
      console.log('Seeding default property...');
      await client.query(`
        INSERT INTO properties (title, city, price, image_url, airbnb_ical_url)
        VALUES (
          'Luxury Arabian Villa', 
          'Dubai', 
          450, 
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
          'https://backend.bnb-pilot.com/api/export/public/prop_96a786be/all.ics?token=fbb799bd606125e828f9cd100872da8fdcb8462879b84c4f09bfb92326ec49a3'
        )
      `);
    }
  } finally {
    client.release();
  }
};

export default pool;
