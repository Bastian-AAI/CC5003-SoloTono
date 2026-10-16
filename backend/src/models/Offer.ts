import { query } from "../db.ts";

export interface IOffer {
  id: string;
  productId: string | null;
  productName: string | null;
  storeId: string;
  storeName: string;
  name: string;
  url: string;
  sku: string | null;
  priceCash: number;
  priceNormal: number;
  inStock: boolean;
  isActive: boolean;
}

interface OfferRow {
  id: number;
  product_id: number | null;
  product_name: string | null;
  store_id: number;
  store_name: string;
  name: string;
  url: string;
  sku: string | null;
  price_cash: number;
  price_normal: number;
  in_stock: boolean;
  is_active: boolean;
}

const mapOfferRow = (row: OfferRow): IOffer => ({
  id: String(row.id),
  productId: row.product_id ? String(row.product_id) : null,
  productName: row.product_name,
  storeId: String(row.store_id),
  storeName: row.store_name,
  name: row.name,
  url: row.url,
  sku: row.sku,
  priceCash: Number(row.price_cash ?? 0),
  priceNormal: Number(row.price_normal ?? 0),
  inStock: Boolean(row.in_stock),
  isActive: Boolean(row.is_active),
});

export const OfferModel = {
  findAll: async (productId?: number): Promise<IOffer[]> => {
    const params: unknown[] = [];
    let where = "";
    if (productId !== undefined && !isNaN(productId)) {
      where = "WHERE e.product_id = $1";
      params.push(productId);
    }

    const res = await query<OfferRow>(
      `SELECT 
         e.id,
         e.product_id,
         p.name AS product_name,
         e.store_id,
         st.name AS store_name,
         e.name,
         e.url,
         e.sku,
         COALESCE(eh.offer_price, 0)::float AS price_cash,
         COALESCE(eh.normal_price, 0)::float AS price_normal,
         COALESCE(eh.is_available, false) AS in_stock,
         e.is_active
       FROM entities e
       JOIN stores st ON e.store_id = st.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN entity_histories eh ON e.active_registry_id = eh.id
       ${where}
       ORDER BY e.id DESC
       LIMIT 200`,
      params,
    );
    return res.rows.map(mapOfferRow);
  },

  findById: async (id: number): Promise<IOffer | null> => {
    const res = await query<OfferRow>(
      `SELECT 
         e.id,
         e.product_id,
         p.name AS product_name,
         e.store_id,
         st.name AS store_name,
         e.name,
         e.url,
         e.sku,
         COALESCE(eh.offer_price, 0)::float AS price_cash,
         COALESCE(eh.normal_price, 0)::float AS price_normal,
         COALESCE(eh.is_available, false) AS in_stock,
         e.is_active
       FROM entities e
       JOIN stores st ON e.store_id = st.id
       LEFT JOIN products p ON e.product_id = p.id
       LEFT JOIN entity_histories eh ON e.active_registry_id = eh.id
       WHERE e.id = $1`,
      [id],
    );
    return res.rows[0] ? mapOfferRow(res.rows[0]) : null;
  },

  create: async (data: {
    storeId: number;
    productId?: number | null;
    name: string;
    url: string;
    sku?: string;
    priceCash: number;
    priceNormal: number;
    inStock?: boolean;
  }): Promise<IOffer> => {
    const key = data.sku?.trim() || `manual-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const isAssociated = Boolean(data.productId);

    const entityRes = await query<{ id: number }>(
      `INSERT INTO entities (
         store_id, product_id, key, sku, name, url, condition, is_active, is_associated,
         creation_date, last_updated, last_pricing_update
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'New', true, $7, NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
       RETURNING id`,
      [
        data.storeId,
        data.productId ?? null,
        key,
        data.sku?.trim() || null,
        data.name.trim(),
        data.url.trim(),
        isAssociated,
      ],
    );

    const entityId = entityRes.rows[0].id;
    const histRes = await query<{ id: number }>(
      `INSERT INTO entity_histories (entity_id, timestamp, is_available, normal_price, offer_price, currency)
       VALUES ($1, NOW() AT TIME ZONE 'utc', $2, $3, $4, 'CLP')
       RETURNING id`,
      [entityId, data.inStock ?? true, data.priceNormal, data.priceCash],
    );

    await query("UPDATE entities SET active_registry_id = $1 WHERE id = $2", [
      histRes.rows[0].id,
      entityId,
    ]);

    const created = await OfferModel.findById(entityId);
    if (!created) throw new Error("Error al recuperar oferta creada");
    return created;
  },

  update: async (
    id: number,
    data: {
      productId?: number | null;
      name?: string;
      url?: string;
      sku?: string;
      priceCash?: number;
      priceNormal?: number;
      inStock?: boolean;
      isActive?: boolean;
    },
  ): Promise<IOffer | null> => {
    const existing = await OfferModel.findById(id);
    if (!existing) return null;

    const nextProductId =
      data.productId !== undefined ? data.productId : existing.productId ? Number(existing.productId) : null;
    const nextName = data.name !== undefined ? data.name.trim() : existing.name;
    const nextUrl = data.url !== undefined ? data.url.trim() : existing.url;
    const nextSku = data.sku !== undefined ? data.sku.trim() : existing.sku;
    const nextActive = data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive;
    const nextCash = data.priceCash !== undefined ? Number(data.priceCash) : existing.priceCash;
    const nextNormal = data.priceNormal !== undefined ? Number(data.priceNormal) : existing.priceNormal;
    const nextStock = data.inStock !== undefined ? Boolean(data.inStock) : existing.inStock;

    await query(
      `UPDATE entities
       SET product_id = $1, is_associated = $2, name = $3, url = $4, sku = $5, is_active = $6, last_updated = NOW() AT TIME ZONE 'utc'
       WHERE id = $7`,
      [nextProductId, Boolean(nextProductId), nextName, nextUrl, nextSku, nextActive, id],
    );

    if (data.priceCash !== undefined || data.priceNormal !== undefined || data.inStock !== undefined) {
      const histRes = await query<{ id: number }>(
        `INSERT INTO entity_histories (entity_id, timestamp, is_available, normal_price, offer_price, currency)
         VALUES ($1, NOW() AT TIME ZONE 'utc', $2, $3, $4, 'CLP')
         RETURNING id`,
        [id, nextStock, nextNormal, nextCash],
      );
      await query(
        "UPDATE entities SET active_registry_id = $1, last_pricing_update = NOW() AT TIME ZONE 'utc' WHERE id = $2",
        [histRes.rows[0].id, id],
      );
    }

    return OfferModel.findById(id);
  },

  remove: async (id: number): Promise<boolean> => {
    await query("UPDATE entities SET active_registry_id = NULL WHERE id = $1", [id]);
    await query("DELETE FROM entity_histories WHERE entity_id = $1", [id]);
    const res = await query("DELETE FROM entities WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export default OfferModel;
