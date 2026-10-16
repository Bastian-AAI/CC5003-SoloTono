import { ensureSchema, pool, query } from "./db.ts";

const username = process.argv[2]?.trim().toLowerCase();

if (!username) {
  console.error("Uso: npm run make-admin -- <username>");
  process.exit(1);
}

const run = async () => {
  await ensureSchema();
  const res = await query<{ id: number; username: string; role: string }>(
    "UPDATE users SET role = 'admin', updated_at = NOW() AT TIME ZONE 'utc' WHERE username = $1 RETURNING id, username, role",
    [username],
  );
  if (res.rows.length === 0) {
    console.error(`No se encontró ningún usuario con username '${username}'.`);
    process.exitCode = 1;
  } else {
    console.log(`Usuario '${res.rows[0].username}' (ID ${res.rows[0].id}) actualizado a rol '${res.rows[0].role}'.`);
  }
  await pool.end();
};

run().catch(async (err) => {
  console.error("Error asignando rol admin:", err);
  await pool.end();
  process.exit(1);
});
