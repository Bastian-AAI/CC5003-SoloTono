import { query } from "../db.ts";

export const ROLES = ["user", "admin", "moderator"] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface IUserWithHash extends IUser {
  passwordHash: string;
}

interface UserRow {
  id: number;
  username: string;
  name: string;
  password_hash?: string;
  role: Role;
  created_at?: string;
}

const mapUserRow = (row: UserRow): IUser => ({
  id: String(row.id),
  username: row.username,
  name: row.name,
  role: row.role,
  ...(row.created_at ? { createdAt: row.created_at } : {}),
});

export const UserModel = {
  findAll: async (): Promise<IUser[]> => {
    const res = await query<UserRow>(
      "SELECT id, username, name, role, created_at FROM users ORDER BY id ASC",
    );
    return res.rows.map(mapUserRow);
  },

  findById: async (id: number): Promise<IUser | null> => {
    const res = await query<UserRow>(
      "SELECT id, username, name, role, created_at FROM users WHERE id = $1",
      [id],
    );
    return res.rows[0] ? mapUserRow(res.rows[0]) : null;
  },

  findByUsernameWithHash: async (username: string): Promise<IUserWithHash | null> => {
    const res = await query<UserRow & { password_hash: string }>(
      "SELECT id, username, name, password_hash, role FROM users WHERE username = $1",
      [username],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      ...mapUserRow(row),
      passwordHash: row.password_hash,
    };
  },

  existsByUsername: async (username: string): Promise<boolean> => {
    const res = await query<{ id: number }>(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );
    return res.rows.length > 0;
  },

  isAdminOrModerator: async (id: number): Promise<boolean> => {
    const res = await query<{ id: number }>(
      "SELECT id FROM users WHERE id = $1 AND role IN ('admin', 'moderator')",
      [id],
    );
    return res.rows.length > 0;
  },

  create: async (data: {
    username: string;
    name: string;
    passwordHash: string;
    role?: Role;
  }): Promise<IUser> => {
    const role = data.role && ROLES.includes(data.role) ? data.role : "user";
    const res = await query<UserRow>(
      `INSERT INTO users (username, name, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'utc', NOW() AT TIME ZONE 'utc')
       RETURNING id, username, name, role, created_at`,
      [data.username, data.name, data.passwordHash, role],
    );
    return mapUserRow(res.rows[0]);
  },

  update: async (
    id: number,
    data: { name?: string; role?: Role; username?: string },
  ): Promise<IUser | null> => {
    const existing = await query<UserRow>(
      "SELECT id, username, name, role FROM users WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0) return null;

    const current = existing.rows[0];
    const nextUsername = data.username ? data.username.trim().toLowerCase() : current.username;
    const nextName = data.name !== undefined ? data.name.trim() : current.name;
    const nextRole = data.role && ROLES.includes(data.role) ? data.role : current.role;

    const res = await query<UserRow>(
      `UPDATE users
       SET username = $1, name = $2, role = $3, updated_at = NOW() AT TIME ZONE 'utc'
       WHERE id = $4
       RETURNING id, username, name, role, created_at`,
      [nextUsername, nextName, nextRole, id],
    );
    return res.rows[0] ? mapUserRow(res.rows[0]) : null;
  },

  remove: async (id: number): Promise<boolean> => {
    const res = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export default UserModel;
