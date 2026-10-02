import { db } from "@/lib/db";

export async function findAllCategories() {
  const result = await db.query(`
        SELECT id_category, label
        FROM categories
        WHERE is_active = true
        ORDER BY label
    `);

  return result.rows;
}

export async function findCategoryById(idCategory: number) {
  const result = await db.query(
    `SELECT 1 FROM categories WHERE id_category = $1 AND is_active = true`,
    [idCategory],
  );

  return result.rows;
}
