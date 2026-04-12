import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL UNIQUE,
      real_email TEXT,
      avatar TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      onboarded BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS registries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      parent_names TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      share_slug TEXT NOT NULL UNIQUE,
      cover_image TEXT,
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      registry_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      price REAL,
      image TEXT,
      retailer TEXT,
      url TEXT,
      category TEXT NOT NULL DEFAULT 'Other',
      notes TEXT,
      is_purchased BOOLEAN NOT NULL DEFAULT false,
      purchased_by TEXT,
      price_alert BOOLEAN NOT NULL DEFAULT false,
      last_known_price REAL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      excerpt TEXT,
      cover_image TEXT,
      author TEXT NOT NULL DEFAULT 'Bump & Bundle',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id SERIAL PRIMARY KEY,
      page_key TEXT NOT NULL UNIQUE,
      title TEXT,
      description TEXT,
      keywords TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      checked BOOLEAN NOT NULL DEFAULT false,
      category TEXT NOT NULL DEFAULT 'General',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS saved_names (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      gender TEXT,
      meaning TEXT,
      liked BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bump_photos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      week INTEGER,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Migrations complete!");
}

migrate().catch(console.error);
