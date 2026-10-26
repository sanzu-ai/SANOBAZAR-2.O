-- Restore the schema's category label for products seeded under category ID 3.
-- Existing products keep their category_id and stock; only the mislabeled name changes.
UPDATE categories
SET category_name = 'Groceries'
WHERE id = 3
  AND category_name = 'Wearables';
