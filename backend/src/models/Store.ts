import { query } from "../db.ts";

export interface IStore {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  scraperClass: string;
  engineType: string;
  isActive: boolean;
}

interface StoreRow {
  id: number;
  name: string;
  slug: string;
  website_url: string;
  scraper_class: string;
  engine_type: string;
  is_active: boolean;
}

const mapStoreRow = (row: StoreRow): IStore => ({
  id: String(row.id),
  name: row.name,
  slug: row.slug,
  websiteUrl: row.website_url,
  scraperClass: row.scraper_class,
  engineType: row.engine_type,
  isActive: row.is_active,
});

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const StoreModel = {
  findAllNames: async (): Promise<string[]> => {
    const res = await query<{ name: string }>(
      "SELECT name FROM stores WHERE is_active = true ORDER BY name ASC",
    );
    return res.rows.map((r) => r.name);
  },

  findAll: async (): Promise<IStore[]> => {
    const res = await query<StoreRow>(
      "SELECT id, name, slug, website_url, scraper_class, engine_type, is_active FROM stores ORDER BY name ASC",
    );
    return res.rows.map(mapStoreRow);
  },

  findById: async (id: number): Promise<IStore | null> => {
    const res = await query<StoreRow>(
      "SELECT id, name, slug, website_url, scraper_class, engine_type, is_active FROM stores WHERE id = $1",
      [id],
    );
    return res.rows[0] ? mapStoreRow(res.rows[0]) : null;
  },

  create: async (data: {
    name: string;
    slug?: string;
    websiteUrl: string;
    scraperClass?: string;
    engineType?: string;
    isActive?: boolean;
  }): Promise<IStore> => {
    const cleanName = data.name.trim();
    const cleanSlug = (data.slug?.trim() || slugify(cleanName)).slice(0, 64);
    const res = await query<StoreRow>(
      `INSERT INTO stores (name, slug, website_url, scraper_class, engine_type, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() AT TIME ZONE 'utc')
       RETURNING id, name, slug, website_url, scraper_class, engine_type, is_active`,
      [
        cleanName,
        cleanSlug,
        data.websiteUrl.trim(),
        data.scraperClass?.trim() || "CustomScraper",
        data.engineType?.trim() || "Custom",
        data.isActive ?? true,
      ],
    );
    return mapStoreRow(res.rows[0]);
  },

  update: async (
    id: number,
    data: {
      name?: string;
      slug?: string;
      websiteUrl?: string;
      scraperClass?: string;
      engineType?: string;
      isActive?: boolean;
    },
  ): Promise<IStore | null> => {
    const existing = await query<StoreRow>(
      "SELECT id, name, slug, website_url, scraper_class, engine_type, is_active FROM stores WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const nextName = data.name !== undefined ? data.name.trim() : current.name;
    const nextSlug = data.slug !== undefined ? data.slug.trim() : current.slug;
    const nextUrl = data.websiteUrl !== undefined ? data.websiteUrl.trim() : current.website_url;
    const nextScraper = data.scraperClass !== undefined ? data.scraperClass.trim() : current.scraper_class;
    const nextEngine = data.engineType !== undefined ? data.engineType.trim() : current.engine_type;
    const nextActive = data.isActive !== undefined ? Boolean(data.isActive) : current.is_active;

    const res = await query<StoreRow>(
      `UPDATE stores
       SET name = $1, slug = $2, website_url = $3, scraper_class = $4, engine_type = $5, is_active = $6
       WHERE id = $7
       RETURNING id, name, slug, website_url, scraper_class, engine_type, is_active`,
      [nextName, nextSlug, nextUrl, nextScraper, nextEngine, nextActive, id],
    );
    return res.rows[0] ? mapStoreRow(res.rows[0]) : null;
  },

  remove: async (id: number): Promise<boolean> => {
    const res = await query("DELETE FROM stores WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export default StoreModel;
