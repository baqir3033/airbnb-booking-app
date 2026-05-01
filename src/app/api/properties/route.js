import pool, { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await initDb();
    const { title, city, price, image_url, airbnb_ical_url } = await req.json();
    
    if (!title || !city || !price) {
      return NextResponse.json({ error: 'Title, city, and price are required' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO properties (title, city, price, image_url, airbnb_ical_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, city, price, image_url, airbnb_ical_url]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
