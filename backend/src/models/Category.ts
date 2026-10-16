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

export interface ITaxonomySection {
  id: number;
  name: string;
  slug: string;
  ordering: number;
  groups: Array<{
    id: number;
    name: string;
    slug: string;
    ordering: number;
    categories: Array<{
      id: number;
      name: string;
      slug: string;
      ordering: number;
    }>;
  }>;
}

export const CategoryModel = {
  findAllNames: async (): Promise<string[]> => {
    const result = await query<{ name: string }>(
      "SELECT name FROM categories WHERE group_id IS NOT NULL ORDER BY ordering ASC, name ASC",
    );
    return result.rows.map((r) => r.name);
  },

  getTaxonomyTree: async (): Promise<ITaxonomySection[]> => {
    const sql = `
      SELECT 
        s.id AS section_id, s.name AS section_name, s.slug AS section_slug, s.ordering AS section_ordering,
        cg.id AS group_id, cg.name AS group_name, cg.slug AS group_slug, cg.ordering AS group_ordering,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.ordering AS category_ordering
      FROM sections s
      JOIN category_groups cg ON cg.section_id = s.id
      JOIN categories c ON c.group_id = cg.id
      ORDER BY s.ordering ASC, cg.ordering ASC, c.ordering ASC
    `;
    const res = await query<{
      section_id: number;
      section_name: string;
      section_slug: string;
      section_ordering: number;
      group_id: number;
      group_name: string;
      group_slug: string;
      group_ordering: number;
      category_id: number;
      category_name: string;
      category_slug: string;
      category_ordering: number;
    }>(sql);

    const sectionsMap = new Map<number, ITaxonomySection>();
    for (const r of res.rows) {
      if (!sectionsMap.has(r.section_id)) {
        sectionsMap.set(r.section_id, {
          id: r.section_id,
          name: r.section_name,
          slug: r.section_slug,
          ordering: r.section_ordering,
          groups: [],
        });
      }
      const sec = sectionsMap.get(r.section_id)!;
      let grp = sec.groups.find((g) => g.id === r.group_id);
      if (!grp) {
        grp = {
          id: r.group_id,
          name: r.group_name,
          slug: r.group_slug,
          ordering: r.group_ordering,
          categories: [],
        };
        sec.groups.push(grp);
      }
      grp.categories.push({
        id: r.category_id,
        name: r.category_name,
        slug: r.category_slug,
        ordering: r.category_ordering,
      });
    }
    return Array.from(sectionsMap.values());
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
