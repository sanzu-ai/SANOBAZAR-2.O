-- Add 100 catalog products without removing or resetting existing products.
-- Safe to rerun: rows with the same category and product name are skipped.
START TRANSACTION;

-- The storefront has a separate Fashion department; keep Accessories for bags and everyday add-ons.
INSERT INTO categories (category_name)
SELECT 'Fashion' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'Fashion');
INSERT INTO categories (category_name)
SELECT 'Accessories' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = 'Accessories');
UPDATE products p
JOIN categories old_category ON old_category.id = p.category_id
JOIN categories fashion ON fashion.category_name = 'Fashion'
SET p.category_id = fashion.id
WHERE old_category.category_name = 'Accessories'
  AND p.name IN ('Classic Denim Jacket', 'Minimalist Leather Sneakers', 'Cotton Casual Hoodie');
UPDATE products p
JOIN categories old_category ON old_category.id = p.category_id
JOIN categories accessories ON accessories.category_name = 'Accessories'
SET p.category_id = accessories.id
WHERE old_category.category_name = 'Fashion'
  AND p.name = 'UV-Protected Sunglasses';

CREATE TEMPORARY TABLE catalog_seed (
  category_name VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  image_url VARCHAR(500) NOT NULL
);

INSERT INTO catalog_seed (category_name, name, price, stock_quantity, image_url) VALUES
('Electronics', 'Smartphone 128GB Dual SIM', 32999.00, 12, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'Android Smartphone 256GB', 47999.00, 8, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'),
('Electronics', '10.4-inch Wi-Fi Tablet', 28999.00, 9, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'Ryzen 5 Everyday Laptop', 84999.00, 5, 'https://images.unsplash.com/photo-1598327105666-5e6e0c64c173?auto=format&fit=crop&w=600&q=80'),
('Electronics', '13-inch Ultrabook Core i5', 99999.00, 4, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'Wireless ANC Earbuds', 4499.00, 22, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'),
('Electronics', '20,000mAh Fast-Charge Power Bank', 2799.00, 25, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'),
('Electronics', '33W USB-C Fast Charger', 1499.00, 30, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'),
('Electronics', '7-in-1 USB-C Hub', 2999.00, 14, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'Full HD USB Webcam', 3499.00, 11, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'RGB Wireless Gaming Mouse', 2199.00, 18, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'),
('Electronics', '1TB Portable SSD', 11999.00, 6, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'),
('Electronics', '43-inch 4K Smart TV', 52999.00, 3, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'Dual-Band Wi-Fi 6 Router', 5499.00, 10, 'https://images.unsplash.com/photo-1598327105666-5e6e0c64c173?auto=format&fit=crop&w=600&q=80'),
('Electronics', 'USB Condenser Microphone', 6999.00, 7, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Everyday Canvas Backpack', 2400.00, 18, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Travel Duffel Bag 35L', 3200.00, 12, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Slim Leather Wallet', 1500.00, 20, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Reversible Casual Belt', 1100.00, 16, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Polarized UV Sunglasses', 1800.00, 14, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Minimal Dial Analog Watch', 3500.00, 8, 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Insulated Steel Water Bottle', 950.00, 30, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Padded 15-inch Laptop Sleeve', 1300.00, 17, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Handmade Metal Keychain', 400.00, 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Compact Card Holder', 800.00, 22, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Travel Cable Organizer', 950.00, 24, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Classic Cotton Tote Bag', 750.00, 28, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Kids School Backpack', 1600.00, 15, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'),
('Accessories', 'Everyday Crossbody Bag', 2200.00, 10, 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Nepali Basmati Rice 5kg', 1150.00, 24, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Masoor Dal 1kg', 230.00, 40, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Buckwheat Flour 1kg', 280.00, 22, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Cold-Pressed Mustard Oil 1L', 460.00, 18, 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Spiced Black Tea 500g', 450.00, 26, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Ground Coffee 200g', 650.00, 15, 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Himalayan Forest Honey 500g', 900.00, 14, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Dried Kidney Beans 1kg', 380.00, 28, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Raw Cane Sugar 1kg', 180.00, 35, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Turmeric Powder 200g', 160.00, 32, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Green Cardamom 100g', 420.00, 12, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Rolled Oats 1kg', 440.00, 20, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Creamy Peanut Butter 340g', 550.00, 17, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'),
('Groceries', 'Millet Snack Mix 500g', 250.00, 23, 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Queen Cotton Bedsheet Set', 2500.00, 11, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Queen Duvet Cover Set', 3800.00, 7, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Ceramic Dinnerware Set 16pc', 4500.00, 6, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Non-Stick Frying Pan 28cm', 1650.00, 14, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Electric Kettle 1.7L', 1800.00, 13, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Handwoven Storage Basket', 850.00, 16, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Modern Floor Lamp', 5200.00, 5, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Minimal Wall Clock', 1400.00, 12, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Foldable Storage Organizer Set', 1100.00, 19, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Cotton Bath Towel Set', 1800.00, 15, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Textured Cushion Cover Pair', 750.00, 24, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Woven Entrance Doormat', 650.00, 21, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Acacia Wood Serving Board', 1200.00, 10, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80'),
('Home & Living', 'Linen Table Runner', 950.00, 13, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Pocket Guide to Nepal Travel', 850.00, 12, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Illustrated Stories for Children', 450.00, 26, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Small Business Basics', 900.00, 9, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'A5 Dotted Journal', 450.00, 30, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Hardcover Sketchbook A4', 550.00, 17, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Assorted Gel Pen Set 12pc', 320.00, 28, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Color Pencil Set 24pc', 480.00, 20, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Wooden Desk Organizer', 700.00, 14, 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Pastel Sticky Notes Set', 220.00, 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'A4 Watercolor Paper Pad', 350.00, 24, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Weekly Desk Planner', 650.00, 16, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Calligraphy Starter Set', 850.00, 10, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Classic English Fiction Paperback', 550.00, 18, 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80'),
('Books & Stationery', 'Grid Notebook 3-Pack', 420.00, 22, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Gentle Daily Face Cleanser 150ml', 550.00, 18, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Daily Sunscreen SPF 50 50ml', 1200.00, 16, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Niacinamide Face Serum 30ml', 950.00, 14, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Soothing Aloe Vera Gel 200ml', 480.00, 20, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Nourishing Body Lotion 250ml', 700.00, 15, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Herbal Hair Oil 100ml', 650.00, 17, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Tea Tree Shampoo 250ml', 590.00, 13, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Bamboo Toothbrush 2-Pack', 180.00, 32, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Shea Butter Lip Balm', 280.00, 25, 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Reusable Cooling Eye Mask', 450.00, 14, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Aromatic Bath Salt 500g', 650.00, 12, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Rose Water Facial Toner', 800.00, 11, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Sandalwood Handmade Soap 3-Pack', 250.00, 19, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'),
('Beauty & Wellness', 'Cushioned Yoga Mat', 1800.00, 8, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Everyday Cotton Kurta', 2200.00, 14, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Classic Unisex Cotton T-Shirt', 850.00, 28, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Embroidered Festive Kurta', 2800.00, 8, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Printed Cotton Kurti', 1800.00, 12, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Linen Blend Casual Shirt', 1900.00, 11, 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Men''s Chino Trousers', 2500.00, 9, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Cotton Pajama Set', 1750.00, 13, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Lightweight Printed Scarf', 900.00, 20, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Pashmina Blend Shawl', 3500.00, 7, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Lightweight Running Shoes', 3200.00, 10, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Everyday Casual Sneakers', 2800.00, 12, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Comfort Leather Sandals', 2300.00, 9, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Water-Resistant Rain Jacket', 2700.00, 8, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Straight Fit Denim Jeans', 2400.00, 15, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'),
('Fashion', 'Kids Cotton T-Shirt', 650.00, 23, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80');

INSERT INTO products (category_id, name, price, stock_quantity, image_url)
SELECT c.id, seed.name, seed.price, seed.stock_quantity, seed.image_url
FROM catalog_seed seed
JOIN (SELECT category_name, MIN(id) AS id FROM categories GROUP BY category_name) c ON c.category_name = seed.category_name
WHERE NOT EXISTS (
  SELECT 1 FROM products existing
  WHERE existing.category_id = c.id AND existing.name = seed.name
);

DROP TEMPORARY TABLE catalog_seed;
COMMIT;

