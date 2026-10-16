import { query } from "../db.ts";
import ProductModel, { type IProduct } from "./Product.ts";

export interface IFavorite {
  id: string;
  userId: string;
  productId: string;
  notes: string;
  targetPrice: number | null;
  createdAt: string;
  product: IProduct | null;
}

interface FavoriteRow {
  id: number;
  user_id: number;
  product_id: number;
  notes: string;
  target_price: string | number | null;
  created_at: string;
}

const hydrateFavorite = async (row: FavoriteRow): Promise<IFavorite> => {
  const product = await ProductModel.findById(row.product_id);
  return {
    id: String(row.id),
    userId: String(row.user_id),
    productId: String(row.product_id),
    notes: row.notes || "",
    targetPrice: row.target_price !== null ? Number(row.target_price) : null,
    createdAt: row.created_at,
    product,
  };
};

export const FavoriteModel = {
  findAllByUser: async (userId: number): Promise<IFavorite[]> => {
    const res = await query<FavoriteRow>(
      "SELECT id, user_id, product_id, notes, target_price, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return Promise.all(res.rows.map(hydrateFavorite));
  },

  findById: async (id: number, userId: number): Promise<IFavorite | null> => {
    const res = await query<FavoriteRow>(
      "SELECT id, user_id, product_id, notes, target_price, created_at FROM favorites WHERE (id = $1 OR product_id = $1) AND user_id = $2 LIMIT 1",
      [id, userId],
    );
    if (res.rows.length === 0) return null;
    return hydrateFavorite(res.rows[0]);
  },

  create: async (data: {
    userId: number;
    productId: number;
    notes?: string;
    targetPrice?: number | null;
  }): Promise<IFavorite> => {
    const res = await query<FavoriteRow>(
      `INSERT INTO favorites (user_id, product_id, notes, target_price, created_at)
       VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'utc')
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET notes = EXCLUDED.notes, target_price = COALESCE(EXCLUDED.target_price, favorites.target_price)
       RETURNING id, user_id, product_id, notes, target_price, created_at`,
      [
        data.userId,
        data.productId,
        data.notes?.trim() ?? "",
        data.targetPrice !== undefined && data.targetPrice !== null ? Number(data.targetPrice) : null,
      ],
    );
    return hydrateFavorite(res.rows[0]);
  },

  update: async (
    idOrProductId: number,
    userId: number,
    data: { notes?: string; targetPrice?: number | null },
  ): Promise<IFavorite | null> => {
    const existingRes = await query<FavoriteRow>(
      "SELECT id, user_id, product_id, notes, target_price, created_at FROM favorites WHERE (id = $1 OR product_id = $1) AND user_id = $2 LIMIT 1",
      [idOrProductId, userId],
    );
    if (existingRes.rows.length === 0) return null;

    const current = existingRes.rows[0];
    const nextNotes = data.notes !== undefined ? data.notes.trim().slice(0, 256) : current.notes;
    const nextTargetPrice =
      data.targetPrice !== undefined
        ? data.targetPrice === null || Number(data.targetPrice) <= 0
          ? null
          : Number(data.targetPrice)
        : current.target_price !== null
          ? Number(current.target_price)
          : null;

    const res = await query<FavoriteRow>(
      `UPDATE favorites
       SET notes = $1, target_price = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, product_id, notes, target_price, created_at`,
      [nextNotes, nextTargetPrice, current.id, userId],
    );
    if (res.rows.length === 0) return null;
    return hydrateFavorite(res.rows[0]);
  },

  remove: async (idOrProductId: number, userId: number): Promise<boolean> => {
    const res = await query(
      "DELETE FROM favorites WHERE (id = $1 OR product_id = $1) AND user_id = $2 RETURNING id",
      [idOrProductId, userId],
    );
    return (res.rowCount ?? 0) > 0;
  },
};

export default FavoriteModel;
