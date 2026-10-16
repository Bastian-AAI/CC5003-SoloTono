import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/index.ts";
import { pool } from "../src/db.ts";

describe("SoloTono API & PostgreSQL Integration Tests", () => {
  after(async () => {
    await pool.end();
  });

  test("GET /api/health should return ok and connected database", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
    assert.equal(res.body.database, "connected");
  });

  test("GET /api/stores should return active retail stores", async () => {
    const res = await request(app).get("/api/stores");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 11);
    assert.ok(res.body.includes("Audiomusica"));
  });

  test("GET /api/categories should return non-empty list of categories", async () => {
    const res = await request(app).get("/api/categories");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  test("GET /api/products should return list of scraped products", async () => {
    const res = await request(app).get("/api/products");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);

    const first = res.body[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(first.brand);
    assert.ok(typeof first.minPrice === "number");
    assert.ok(Array.isArray(first.offers));
  });

  test("GET /api/products/:id and /history should return product detail and history", async () => {
    const listRes = await request(app).get("/api/products");
    const testProduct = listRes.body[0];

    const res = await request(app).get(`/api/products/${testProduct.id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, testProduct.id);
    assert.equal(res.body.name, testProduct.name);

    const histRes = await request(app).get(`/api/products/${testProduct.id}/history`);
    assert.equal(histRes.status, 200);
    assert.ok(Array.isArray(histRes.body));

    const notFoundRes = await request(app).get("/api/products/99999999");
    assert.equal(notFoundRes.status, 404);

    const invalidIdRes = await request(app).get("/api/products/not-a-number");
    assert.equal(invalidIdRes.status, 400);
  });

  test("Protected routes reject unauthenticated requests with 401", async () => {
    const favRes = await request(app).get("/api/favorites");
    assert.equal(favRes.status, 401);

    const createProdRes = await request(app)
      .post("/api/products")
      .send({ name: "Test", brand: "Test" });
    assert.equal(createProdRes.status, 401);

    const usersRes = await request(app).get("/api/users");
    assert.equal(usersRes.status, 401);
  });

  test("Auth flow (register, login, /me, logout) and Favorites CRUD", async () => {
    const testUsername = `user_${Date.now()}`;
    const testPassword = "PasswordTest123!";

    // 1. Registro
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ username: testUsername, name: "Test User", password: testPassword });

    assert.equal(regRes.status, 201);
    assert.equal(regRes.body.username, testUsername);
    const cookies = regRes.headers["set-cookie"];
    const csrfToken = regRes.headers["x-csrf-token"];
    assert.ok(cookies);
    assert.equal(typeof csrfToken, "string");

    // 2. Sesión activa (/api/auth/me)
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.username, testUsername);

    // 3. Usuario normal recibe 403 en ruta exclusiva de admin
    const adminAttempt = await request(app)
      .post("/api/products")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ name: "No autorizado", brand: "Fender" });
    assert.equal(adminAttempt.status, 403);

    // 4. CRUD de Favoritos para el usuario autenticado
    const listProducts = await request(app).get("/api/products");
    const targetProductId = listProducts.body[0].id;

    const addFavRes = await request(app)
      .post("/api/favorites")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ productId: targetProductId, notes: "Comprar en oferta", targetPrice: 150000 });
    assert.equal(addFavRes.status, 201);
    assert.equal(addFavRes.body.productId, String(targetProductId));

    const getFavsRes = await request(app)
      .get("/api/favorites")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);
    assert.equal(getFavsRes.status, 200);
    assert.equal(getFavsRes.body.length, 1);

    const updateFavRes = await request(app)
      .put(`/api/favorites/${addFavRes.body.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ notes: "Nota actualizada", targetPrice: 140000 });
    assert.equal(updateFavRes.status, 200);
    assert.equal(updateFavRes.body.notes, "Nota actualizada");

    const delFavRes = await request(app)
      .delete(`/api/favorites/${addFavRes.body.id}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);
    assert.equal(delFavRes.status, 200);

    // 5. Logout
    const logoutRes = await request(app).post("/api/auth/logout");
    assert.equal(logoutRes.status, 200);
  });

  test("Admin CRUD for products, categories, stores and offers", async () => {
    // Login con cuenta admin inicializada por ensureSchema
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin12345" });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.role, "admin");

    const cookies = loginRes.headers["set-cookie"];
    const csrfToken = loginRes.headers["x-csrf-token"];

    // Crear producto
    const createProd = await request(app)
      .post("/api/products")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Guitarra Test CRUD",
        brand: "Fender",
        category: "Guitarras Eléctricas",
        description: "Producto de prueba CRUD",
      });
    assert.equal(createProd.status, 201);
    const createdProdId = createProd.body.id;

    // Actualizar producto
    const updateProd = await request(app)
      .put(`/api/products/${createdProdId}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken)
      .send({ name: "Guitarra Test CRUD Editada" });
    assert.equal(updateProd.status, 200);
    assert.equal(updateProd.body.name, "Guitarra Test CRUD Editada");

    // Eliminar producto
    const deleteProd = await request(app)
      .delete(`/api/products/${createdProdId}`)
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);
    assert.equal(deleteProd.status, 200);
  });
});
