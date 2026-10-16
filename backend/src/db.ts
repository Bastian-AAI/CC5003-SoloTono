import pg from "pg";
import bcrypt from "bcrypt";
import config from "./config.ts";
import logger from "./utils/logger.ts";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool.on("error", (err: Error) => {
  logger.error("Unexpected error on idle PostgreSQL client", err);
});

export const query = async <T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (duration > 100) {
    logger.info(`Slow query (${duration}ms): ${text}`);
  }
  return res;
};

const DEFAULT_STORES = [
  { name: "Audiomusica", slug: "audiomusica", url: "https://www.audiomusica.com", cls: "AudiomusicaScraper", engine: "VTEX" },
  { name: "ProMusic", slug: "promusic", url: "https://promusic.cl", cls: "PromusicScraper", engine: "Shopify" },
  { name: "RD Músico", slug: "rdmusico", url: "https://rdmusico.cl", cls: "RdMusicoScraper", engine: "Shopify" },
  { name: "Fat Store", slug: "fatstore", url: "https://fatstore.cl", cls: "FatStoreScraper", engine: "Shopify" },
  { name: "Fender Chile", slug: "fender", url: "https://fender.cl", cls: "FenderChileScraper", engine: "Magento" },
  { name: "Casa Amarilla", slug: "casamarilla", url: "https://casamarilla.cl", cls: "CasaAmarillaScraper", engine: "OpenCart" },
  { name: "Music Chile", slug: "musicchile", url: "https://musicchile.cl", cls: "MusicChileScraper", engine: "Jumpseller" },
  { name: "Instrumentos Chile", slug: "instrumentoschile", url: "https://instrumentoschile.cl", cls: "InstrumentosChileScraper", engine: "Magento" },
  { name: "Epic Music", slug: "epicmusic", url: "https://epicmusic.cl", cls: "EpicMusicScraper", engine: "Jumpseller" },
  { name: "Factory Sound", slug: "factorysound", url: "https://factorysound.cl", cls: "FactorySoundScraper", engine: "Prestashop" },
  { name: "Overdrive", slug: "overdrive", url: "https://overdrive.cl", cls: "OverdriveScraper", engine: "WooCommerce" },
];

let schemaInitialized = false;

export const ensureSchema = async (): Promise<void> => {
  if (schemaInitialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) UNIQUE NOT NULL,
      ordering INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS category_groups (
      id SERIAL PRIMARY KEY,
      section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) UNIQUE NOT NULL,
      ordering INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      group_id INTEGER REFERENCES category_groups(id) ON DELETE SET NULL,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) UNIQUE NOT NULL,
      ordering INTEGER NOT NULL DEFAULT 0,
      short_description_template TEXT,
      browse_result_template TEXT,
      detail_template TEXT,
      meta_tag_description TEXT
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) UNIQUE NOT NULL,
      params VARCHAR(256) NOT NULL DEFAULT '',
      ordering INTEGER NOT NULL DEFAULT 0,
      meta_tag_description TEXT
    );

    CREATE TABLE IF NOT EXISTS stores (
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      slug VARCHAR(64) UNIQUE NOT NULL,
      website_url VARCHAR(256) NOT NULL,
      scraper_class VARCHAR(64) NOT NULL DEFAULT 'CustomScraper',
      engine_type VARCHAR(32) NOT NULL DEFAULT 'Custom',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      category VARCHAR(128),
      name VARCHAR(256) NOT NULL,
      brand VARCHAR(128) NOT NULL,
      family VARCHAR(128),
      part_number VARCHAR(64),
      ean VARCHAR(32),
      description TEXT,
      picture_url VARCHAR(512),
      specs_json TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      updated_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
    );

    CREATE TABLE IF NOT EXISTS entities (
      id SERIAL PRIMARY KEY,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      key VARCHAR(256) NOT NULL,
      sku VARCHAR(128),
      name VARCHAR(256) NOT NULL,
      url VARCHAR(512) NOT NULL,
      brand VARCHAR(128),
      category VARCHAR(128),
      part_number VARCHAR(128),
      ean VARCHAR(32),
      condition VARCHAR(64) NOT NULL DEFAULT 'New',
      picture_urls TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      is_associated BOOLEAN NOT NULL DEFAULT false,
      active_registry_id INTEGER,
      creation_date TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      last_updated TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      last_pricing_update TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      CONSTRAINT uix_store_key UNIQUE (store_id, key)
    );

    CREATE TABLE IF NOT EXISTS entity_histories (
      id SERIAL PRIMARY KEY,
      entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      is_available BOOLEAN NOT NULL DEFAULT true,
      normal_price NUMERIC(12, 2) NOT NULL,
      offer_price NUMERIC(12, 2) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'CLP',
      stock INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(32) UNIQUE NOT NULL,
      name VARCHAR(64) NOT NULL DEFAULT '',
      password_hash VARCHAR(256) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      updated_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      notes VARCHAR(256) NOT NULL DEFAULT '',
      target_price NUMERIC(12, 2),
      created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
      CONSTRAINT uix_user_product_favorite UNIQUE (user_id, product_id)
    );
  `);

  // Asegurar las 11 tiendas base
  for (const s of DEFAULT_STORES) {
    await query(
      `INSERT INTO stores (name, slug, website_url, scraper_class, engine_type, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW() AT TIME ZONE 'utc')
       ON CONFLICT (slug) DO NOTHING`,
      [s.name, s.slug, s.url, s.cls, s.engine],
    );
  }

  // Asegurar categorías base si aún no se ha corrido scraper:init
  const catCount = await query<{ count: string }>("SELECT COUNT(*)::text AS count FROM categories");
  if (Number(catCount.rows[0]?.count ?? 0) === 0) {
    await query(
      `INSERT INTO categories (name, slug, ordering)
       VALUES
         ('Guitarras Eléctricas', 'guitarras-electricas', 1),
         ('Bajos Eléctricos', 'bajos-electricos', 2),
         ('Teclados y Pianos', 'teclados-y-pianos', 3),
         ('Baterías y Percusión', 'baterias-y-percusion', 4),
         ('Amplificadores', 'amplificadores', 5),
         ('Pedales y Efectos', 'pedales-y-efectos', 6)
       ON CONFLICT (slug) DO NOTHING`,
    );
  }

  // Asegurar al menos un producto base si aún no se ha corrido scraper:scrape
  const prodCount = await query<{ count: string }>("SELECT COUNT(*)::text AS count FROM products");
  if (Number(prodCount.rows[0]?.count ?? 0) === 0) {
    const storeRow = await query<{ id: number }>("SELECT id FROM stores WHERE slug = 'audiomusica' LIMIT 1");
    const catRow = await query<{ id: number }>("SELECT id FROM categories WHERE slug = 'guitarras-electricas' LIMIT 1");
    const storeId = storeRow.rows[0]?.id;
    const catId = catRow.rows[0]?.id ?? null;

    const prodRes = await query<{ id: number }>(
      `INSERT INTO products (name, brand, category, category_id, description, picture_url, created_at, updated_at)
       VALUES ('Fender Player Stratocaster MN Polar White', 'Fender', 'Guitarras Eléctricas', $1, 'Guitarra eléctrica serie Player con mástil de arce.', '/images/products/fender-player-strat.jpg', NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
       RETURNING id`,
      [catId],
    );
    const prodId = prodRes.rows[0]?.id;

    if (storeId && prodId) {
      const entRes = await query<{ id: number }>(
        `INSERT INTO entities (store_id, product_id, category_id, key, sku, name, url, brand, category, condition, is_active, is_associated, creation_date, last_updated, last_pricing_update)
         VALUES ($1, $2, $3, 'seed-fender-player-strat', 'FEN-0144502515', 'Guitarra Eléctrica Fender Player Stratocaster Polar White', 'https://www.audiomusica.com', 'Fender', 'Guitarras Eléctricas', 'New', true, true, NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
         RETURNING id`,
        [storeId, prodId, catId],
      );
      const entId = entRes.rows[0]?.id;
      if (entId) {
        const histRes = await query<{ id: number }>(
          `INSERT INTO entity_histories (entity_id, timestamp, is_available, normal_price, offer_price, currency)
           VALUES ($1, NOW() AT TIME ZONE 'utc', true, 829990, 789990, 'CLP')
           RETURNING id`,
          [entId],
        );
        await query("UPDATE entities SET active_registry_id = $1 WHERE id = $2", [histRes.rows[0]?.id, entId]);
      }
    }
  }

  // Asegurar usuario administrador inicial para pruebas y gestión del sistema
  const adminRes = await query<{ id: number }>("SELECT id FROM users WHERE username = 'admin'");
  if (adminRes.rows.length === 0) {
    const adminHash = await bcrypt.hash("admin12345", 10);
    await query(
      `INSERT INTO users (username, name, password_hash, role, created_at, updated_at)
       VALUES ('admin', 'Administrador SoloTono', $1, 'admin', NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
       ON CONFLICT (username) DO NOTHING`,
      [adminHash],
    );
  }

  schemaInitialized = true;
};

export default { pool, query, ensureSchema };
