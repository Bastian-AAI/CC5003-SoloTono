import { query } from "../db.ts";

export interface IStoreOfferSummary {
  id: string;
  storeName: string;
  storeLogo?: string;
  priceCash: number;
  priceNormal: number;
  inStock: boolean;
  productUrl: string;
}

export interface IProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  section: string;
  subCategory?: string;
  imageUrl: string;
  description: string;
  minPrice: number;
  offers: IStoreOfferSummary[];
}

export interface IPriceHistoryPoint {
  id: number;
  timestamp: string;
  inStock: boolean;
  priceCash: number;
  priceNormal: number;
  storeName: string;
  entityId: string;
}

export interface ProductFilterOptions {
  category?: string;
  section?: string;
  store?: string;
  q?: string;
  sort?: string;
  in_stock?: string;
}

interface RawProductRow {
  id: number;
  name: string;
  brand: string;
  category: string;
  section: string;
  sub_category?: string;
  picture_url: string | null;
  description: string | null;
  offers: IStoreOfferSummary[] | null;
  min_price: number;
}

const mapProductRow = (row: RawProductRow): IProduct => ({
  id: String(row.id),
  name: row.name,
  brand: row.brand,
  category: row.category,
  section: row.section,
  subCategory: row.sub_category || undefined,
  imageUrl: row.picture_url || "/placeholder-instrument.svg",
  description:
    row.description ||
    `Instrumento musical ${row.brand} ${row.name}. Consulta ofertas en tiendas asociadas.`,
  minPrice: row.min_price,
  offers: row.offers || [],
});

export const ProductModel = {
  findAll: async (filters: ProductFilterOptions = {}): Promise<IProduct[]> => {
    const { category, section, store, q, sort, in_stock } = filters;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (in_stock === "true") {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM entities e_stock
          JOIN entity_histories eh_stock ON e_stock.active_registry_id = eh_stock.id
          WHERE e_stock.product_id = p.id
            AND e_stock.is_active = true
            AND eh_stock.is_available = true
            AND eh_stock.offer_price > 0
        )`,
      );
    }

    if (typeof section === "string" && section.trim() !== "" && section !== "Todas") {
      conditions.push(`(s.name ILIKE $${paramIndex} OR s.slug ILIKE $${paramIndex})`);
      params.push(`%${section.trim()}%`);
      paramIndex++;
    }

    if (typeof category === "string" && category.trim() !== "" && category !== "Todas") {
      conditions.push(
        `(c.name ILIKE $${paramIndex} OR c.slug ILIKE $${paramIndex} OR p.category ILIKE $${paramIndex} OR cg.name ILIKE $${paramIndex})`,
      );
      params.push(`%${category.trim()}%`);
      paramIndex++;
    }

    if (typeof store === "string" && store.trim() !== "" && store !== "Todas") {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM entities e2
          JOIN stores st2 ON e2.store_id = st2.id
          LEFT JOIN entity_histories eh2 ON e2.active_registry_id = eh2.id
          WHERE e2.product_id = p.id
            AND e2.is_active = true
            AND (st2.name ILIKE $${paramIndex} OR st2.slug ILIKE $${paramIndex})
            AND (eh2.is_available = true)
        )`,
      );
      params.push(`%${store.trim()}%`);
      paramIndex++;
    }

    if (typeof q === "string" && q.trim() !== "") {
      const terms = q.trim().split(/\s+/).filter(Boolean);
      for (const term of terms) {
        conditions.push(
          `(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex} OR COALESCE(p.description, '') ILIKE $${paramIndex} OR COALESCE(p.category, '') ILIKE $${paramIndex})`,
        );
        params.push(`%${term}%`);
        paramIndex++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderByClause = "ORDER BY min_price ASC NULLS LAST, id DESC";
    if (sort === "price_desc") {
      orderByClause = "ORDER BY min_price DESC NULLS LAST, id DESC";
    } else if (sort === "name_asc") {
      orderByClause = "ORDER BY name ASC";
    }

    const sql = `
      WITH product_summaries AS (
        SELECT 
          p.id,
          p.name,
          p.brand,
          COALESCE(c.name, p.category, 'Instrumentos') AS category,
          COALESCE(s.name, 'Instrumentos') AS section,
          COALESCE(cg.name, p.family, '') AS sub_category,
          COALESCE(
            NULLIF(p.picture_url, ''),
            split_part(MIN(NULLIF(e.picture_urls, '')), ',', 1),
            ''
          ) AS picture_url,
          p.description,
          COALESCE(
            json_agg(
              json_build_object(
                'id', e.id::text,
                'storeName', st.name,
                'priceCash', COALESCE(eh.offer_price, 0)::float,
                'priceNormal', COALESCE(eh.normal_price, 0)::float,
                'inStock', COALESCE(eh.is_available, false),
                'productUrl', e.url
              )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) AS offers,
          COALESCE(
            MIN(CASE WHEN eh.is_available = true THEN eh.offer_price ELSE NULL END),
            MIN(eh.offer_price),
            0
          )::float AS min_price
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN category_groups cg ON c.group_id = cg.id
        LEFT JOIN sections s ON cg.section_id = s.id
        LEFT JOIN entities e ON e.product_id = p.id AND e.is_active = true
        LEFT JOIN stores st ON e.store_id = st.id
        LEFT JOIN entity_histories eh ON e.active_registry_id = eh.id
        ${whereClause}
        GROUP BY p.id, p.name, p.brand, c.name, s.name, cg.name, p.family, p.picture_url, p.description
      )
      SELECT * FROM product_summaries
      ${orderByClause}
    `;

    const result = await query<RawProductRow>(sql, params);
    return result.rows.map(mapProductRow);
  },

  findById: async (id: number): Promise<IProduct | null> => {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.brand,
        COALESCE(c.name, p.category, 'Instrumentos') AS category,
        COALESCE(s.name, 'Instrumentos') AS section,
        COALESCE(cg.name, p.family, '') AS sub_category,
        COALESCE(
          NULLIF(p.picture_url, ''),
          split_part(MIN(NULLIF(e.picture_urls, '')), ',', 1),
          ''
        ) AS picture_url,
        p.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id::text,
              'storeName', st.name,
              'priceCash', COALESCE(eh.offer_price, 0)::float,
              'priceNormal', COALESCE(eh.normal_price, 0)::float,
              'inStock', COALESCE(eh.is_available, false),
              'productUrl', e.url
            )
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) AS offers,
        COALESCE(
          MIN(CASE WHEN eh.is_available = true THEN eh.offer_price ELSE NULL END),
          MIN(eh.offer_price),
          0
        )::float AS min_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN category_groups cg ON c.group_id = cg.id
      LEFT JOIN sections s ON cg.section_id = s.id
      LEFT JOIN entities e ON e.product_id = p.id AND e.is_active = true
      LEFT JOIN stores st ON e.store_id = st.id
      LEFT JOIN entity_histories eh ON e.active_registry_id = eh.id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.brand, c.name, s.name, cg.name, p.family, p.picture_url, p.description
    `;

    const result = await query<RawProductRow>(sql, [id]);
    if (result.rows.length === 0) return null;
    return mapProductRow(result.rows[0]);
  },

  getHistory: async (productId: number): Promise<IPriceHistoryPoint[]> => {
    const sql = `
      SELECT 
        eh.id,
        eh.timestamp,
        eh.is_available AS "inStock",
        eh.offer_price::float AS "priceCash",
        eh.normal_price::float AS "priceNormal",
        st.name AS "storeName",
        e.id::text AS "entityId"
      FROM entity_histories eh
      JOIN entities e ON eh.entity_id = e.id
      JOIN stores st ON e.store_id = st.id
      WHERE e.product_id = $1
      ORDER BY eh.timestamp ASC
    `;
    const result = await query<IPriceHistoryPoint>(sql, [productId]);
    return result.rows;
  },

  create: async (data: {
    name: string;
    brand: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    partNumber?: string;
  }): Promise<IProduct> => {
    const catName = data.category?.trim() || "Instrumentos";
    const catLookup = await query<{ id: number }>(
      "SELECT id FROM categories WHERE name ILIKE $1 OR slug ILIKE $1 LIMIT 1",
      [catName],
    );
    const categoryId = catLookup.rows[0]?.id ?? null;

    const insertRes = await query<{ id: number }>(
      `INSERT INTO products (name, brand, category, category_id, description, picture_url, part_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
       RETURNING id`,
      [
        data.name.trim(),
        data.brand.trim(),
        catName,
        categoryId,
        data.description?.trim() || null,
        data.imageUrl?.trim() || "/placeholder-instrument.svg",
        data.partNumber?.trim() || null,
      ],
    );
    const created = await ProductModel.findById(insertRes.rows[0].id);
    if (!created) {
      throw new Error("Error al recuperar el producto creado");
    }
    return created;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      brand?: string;
      category?: string;
      description?: string;
      imageUrl?: string;
      partNumber?: string;
    },
  ): Promise<IProduct | null> => {
    const existing = await query<{
      name: string;
      brand: string;
      category: string | null;
      category_id: number | null;
      description: string | null;
      picture_url: string | null;
      part_number: string | null;
    }>("SELECT name, brand, category, category_id, description, picture_url, part_number FROM products WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const nextName = data.name !== undefined ? data.name.trim() : current.name;
    const nextBrand = data.brand !== undefined ? data.brand.trim() : current.brand;
    const nextCategory = data.category !== undefined ? data.category.trim() : current.category;
    const nextDesc = data.description !== undefined ? data.description.trim() : current.description;
    const nextImage = data.imageUrl !== undefined ? data.imageUrl.trim() : current.picture_url;
    const nextPart = data.partNumber !== undefined ? data.partNumber.trim() : current.part_number;

    let nextCategoryId = current.category_id;
    if (data.category !== undefined && nextCategory) {
      const catLookup = await query<{ id: number }>(
        "SELECT id FROM categories WHERE name ILIKE $1 OR slug ILIKE $1 LIMIT 1",
        [nextCategory],
      );
      nextCategoryId = catLookup.rows[0]?.id ?? current.category_id;
    }

    await query(
      `UPDATE products
       SET name = $1, brand = $2, category = $3, category_id = $4, description = $5, picture_url = $6, part_number = $7, updated_at = NOW() AT TIME ZONE 'utc'
       WHERE id = $8`,
      [nextName, nextBrand, nextCategory, nextCategoryId, nextDesc, nextImage, nextPart, id],
    );

    return ProductModel.findById(id);
  },

  remove: async (id: number): Promise<boolean> => {
    await query("UPDATE entities SET product_id = NULL, is_associated = false WHERE product_id = $1", [id]);
    const res = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export default ProductModel;
