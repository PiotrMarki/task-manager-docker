const express = require("express");
const path = require("path");
const { pool, waitForDb } = require("./db");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: "db not reachable" });
  }
});


app.get("/api/categories", async (req, res) => {
  const { rows } = await pool.query("SELECT id, name FROM categories ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/categories", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });

  try {
    const { rows } = await pool.query(
      "INSERT INTO categories(name) VALUES($1) RETURNING id, name",
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: "cannot create category (maybe duplicate?)" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();

  if (!id) return res.status(400).json({ error: "bad id" });
  if (!name) return res.status(400).json({ error: "name required" });

  const { rows } = await pool.query(
    "UPDATE categories SET name=$1 WHERE id=$2 RETURNING id, name",
    [name, id]
  );

  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.delete("/api/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });

  const result = await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });

  res.status(204).send();
});


app.get("/api/recipes", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.title, r.ingredients, r.instructions, r.rating, r.category_id,
            c.name AS category_name
     FROM recipes r
     LEFT JOIN categories c ON c.id = r.category_id
     ORDER BY r.id DESC`
  );
  res.json(rows);
});

app.post("/api/recipes", async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const ingredients = String(req.body?.ingredients || "").trim();
  const instructions = String(req.body?.instructions || "").trim();
  const rating = Number(req.body?.rating ?? 3);

  const categoryId =
    req.body?.category_id === null || req.body?.category_id === undefined
      ? null
      : Number(req.body.category_id);

  if (!title) return res.status(400).json({ error: "title required" });
  if (!ingredients) return res.status(400).json({ error: "ingredients required" });
  if (!instructions) return res.status(400).json({ error: "instructions required" });

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be 1-5" });
  }

  if (categoryId !== null && Number.isNaN(categoryId)) {
    return res.status(400).json({ error: "bad category_id" });
  }

  const { rows } = await pool.query(
    `INSERT INTO recipes(title, ingredients, instructions, rating, category_id)
     VALUES($1,$2,$3,$4,$5)
     RETURNING id, title, ingredients, instructions, rating, category_id`,
    [title, ingredients, instructions, rating, categoryId]
  );

  res.status(201).json(rows[0]);
});

app.put("/api/recipes/:id", async (req, res) => {
  const id = Number(req.params.id);

  const title = String(req.body?.title || "").trim();
  const ingredients = String(req.body?.ingredients || "").trim();
  const instructions = String(req.body?.instructions || "").trim();
  const rating = Number(req.body?.rating ?? 3);

  const categoryId =
    req.body?.category_id === null || req.body?.category_id === undefined
      ? null
      : Number(req.body.category_id);

  if (!id) return res.status(400).json({ error: "bad id" });
  if (!title) return res.status(400).json({ error: "title required" });
  if (!ingredients) return res.status(400).json({ error: "ingredients required" });
  if (!instructions) return res.status(400).json({ error: "instructions required" });

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be 1-5" });
  }

  if (categoryId !== null && Number.isNaN(categoryId)) {
    return res.status(400).json({ error: "bad category_id" });
  }

  const { rows } = await pool.query(
    `UPDATE recipes
     SET title=$1, ingredients=$2, instructions=$3, rating=$4, category_id=$5
     WHERE id=$6
     RETURNING id, title, ingredients, instructions, rating, category_id`,
    [title, ingredients, instructions, rating, categoryId, id]
  );

  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.delete("/api/recipes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });

  const result = await pool.query("DELETE FROM recipes WHERE id=$1", [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "not found" });

  res.status(204).send();
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const port = Number(process.env.PORT || 3000);

(async () => {
  await waitForDb();
  app.listen(port, "0.0.0.0", () => {
    console.log(`App listening on http://localhost:${port}`);
  });
})().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
