-- Merge duplicate category rows and remove only unreferenced duplicate product copies.
-- For each category name, the lowest id is kept as the canonical category.
START TRANSACTION;

DELETE duplicate_product
FROM products duplicate_product
JOIN categories duplicate_category ON duplicate_category.id = duplicate_product.category_id
JOIN categories canonical_category
  ON canonical_category.category_name = duplicate_category.category_name
 AND canonical_category.id = (
   SELECT MIN(category_id.id)
   FROM categories category_id
   WHERE category_id.category_name = duplicate_category.category_name
 )
JOIN products canonical_product
  ON canonical_product.category_id = canonical_category.id
 AND canonical_product.name = duplicate_product.name
WHERE duplicate_category.id <> canonical_category.id
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = duplicate_product.id)
  AND NOT EXISTS (SELECT 1 FROM cart_items ci WHERE ci.product_id = duplicate_product.id);

UPDATE products product_row
JOIN categories duplicate_category ON duplicate_category.id = product_row.category_id
JOIN categories canonical_category
  ON canonical_category.category_name = duplicate_category.category_name
 AND canonical_category.id = (
   SELECT MIN(category_id.id)
   FROM categories category_id
   WHERE category_id.category_name = duplicate_category.category_name
 )
LEFT JOIN products canonical_product
  ON canonical_product.category_id = canonical_category.id
 AND canonical_product.name = product_row.name
SET product_row.category_id = canonical_category.id
WHERE duplicate_category.id <> canonical_category.id
  AND canonical_product.id IS NULL;

DELETE duplicate_category
FROM categories duplicate_category
JOIN (
  SELECT category_name, MIN(id) AS canonical_id
  FROM categories
  GROUP BY category_name
  HAVING COUNT(*) > 1
) duplicate_names ON duplicate_names.category_name = duplicate_category.category_name
WHERE duplicate_category.id <> duplicate_names.canonical_id
  AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = duplicate_category.id);

COMMIT;

SET @category_name_duplicates = (
  SELECT COUNT(*) FROM (
    SELECT category_name FROM categories GROUP BY category_name HAVING COUNT(*) > 1
  ) duplicates
);
SET @category_name_unique_index = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'categories'
    AND column_name = 'category_name'
    AND non_unique = 0
);
SET @category_index_sql = IF(
  @category_name_duplicates = 0 AND @category_name_unique_index = 0,
  'ALTER TABLE categories ADD UNIQUE KEY uq_categories_category_name (category_name)',
  'SELECT 1'
);
PREPARE category_index_statement FROM @category_index_sql;
EXECUTE category_index_statement;
DEALLOCATE PREPARE category_index_statement;
