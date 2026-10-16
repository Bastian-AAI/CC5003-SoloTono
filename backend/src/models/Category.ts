import { query } from "../db.ts";

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  groupId: number | null;
  ordering: number;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  group_id: number | null;
  ordering: number;
}

const mapCategoryRow = (row: CategoryRow): ICategory => ({
  id: String(row.id),
  name: row.name,
  slug: row.slug,
  groupId: row.group_id,
  ordering: row.ordering,
});

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CategoryModel = {
  findAllNames: async (): Promise<string[]> => {
    const result = await query<{ name: string }>(
      `SELECT DISTINCT name FROM (
        SELECT name FROM categories
        UNION
        SELECT category AS name FROM products WHERE category IS NOT NULL AND category != ''
      ) AS all_cats
      ORDER BY name ASC`,
    );
    return result.rows.map((r) => r.name);
  },

  findAll: async (): Promise<ICategory[]> => {
    const res = await query<CategoryRow>(
      "SELECT id, name, slug, group_id, ordering FROM categories ORDER BY ordering ASC, name ASC",
    );
    return res.rows.map(mapCategoryRow);
  },

  findById: async (id: number): Promise<ICategory | null> => {
    const res = await query<CategoryRow>(
      "SELECT id, name, slug, group_id, ordering FROM categories WHERE id = $1",
      [id],
    );
    return res.rows[0] ? mapCategoryRow(res.rows[0]) : null;
  },

  create: async (data: {
    name: string;
    slug?: string;
    groupId?: number | null;
    ordering?: number;
  }): Promise<ICategory> => {
    const cleanName = data.name.trim();
    const cleanSlug = (data.slug?.trim() || slugify(cleanName)).slice(0, 64);
    const res = await query<CategoryRow>(
      `INSERT INTO categories (name, slug, group_id, ordering)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, group_id, ordering`,
      [cleanName, cleanSlug, data.groupId ?? null, data.ordering ?? 0],
    );
    return mapCategoryRow(res.rows[0]);
  },

  update: async (
    id: number,
    data: {
      name?: string;
      slug?: string;
      groupId?: number | null;
      ordering?: number;
    },
  ): Promise<ICategory | null> => {
    const existing = await query<CategoryRow>(
      "SELECT id, name, slug, group_id, ordering FROM categories WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const nextName = data.name !== undefined ? data.name.trim() : current.name;
    const nextSlug = data.slug !== undefined ? data.slug.trim() : current.slug;
    const nextGroup = data.groupId !== undefined ? data.groupId : current.group_id;
    const nextOrdering = data.ordering !== undefined ? Number(data.ordering) : current.ordering;

    const res = await query<CategoryRow>(
      `UPDATE categories
       SET name = $1, slug = $2, group_id = $3, ordering = $4
       WHERE id = $5
       RETURNING id, name, slug, group_id, ordering`,
      [nextName, nextSlug, nextGroup, nextOrdering, id],
    );
    return res.rows[0] ? mapCategoryRow(res.rows[0]) : null;
  },

  remove: async (id: number): Promise<boolean> => {
    await query("UPDATE products SET category_id = NULL WHERE category_id = $1", [id]);
    await query("UPDATE entities SET category_id = NULL WHERE category_id = $1", [id]);
    const res = await query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export default CategoryModel;
