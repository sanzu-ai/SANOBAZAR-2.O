-- SANOBAZAR Complete Database Schema with Seed Data
CREATE DATABASE IF NOT EXISTS sanobazar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sanobazar_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. PRODUCTS TABLE
-- Monetary values in products, orders, and order_items are denominated in Nepalese rupees (NPR).
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address VARCHAR(500) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    payment_method ENUM('cod', 'digital') NOT NULL DEFAULT 'cod',
    payment_status ENUM('pending', 'simulated') NOT NULL DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Signed-in customer carts persist across devices and browsers.
CREATE TABLE IF NOT EXISTS cart_items (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Public contact form submissions, readable only by authenticated admins.
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(30) NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_messages_created_at (created_at)
);

-- Categories Seed Data
INSERT IGNORE INTO categories (id, category_name) VALUES
(1, 'Electronics'),
(2, 'Fashion'),
(3, 'Groceries'),
(4, 'Home & Living'),
(5, 'Books & Stationery'),
(6, 'Beauty & Wellness');

-- Products Seed Data. INSERT IGNORE keeps this setup script safe to rerun:
-- it adds missing sample products without deleting orders or resetting stock.
INSERT IGNORE INTO products (id, category_id, name, price, stock_quantity, image_url) VALUES
(1, 1, 'Wireless Noise-Canceling Headphones', 8500.00, 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'),
(2, 1, 'Smart Fitness Watch Series 5', 4200.00, 8, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'),
(3, 1, 'Portable Bluetooth Speaker', 2800.00, 20, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80'),
(4, 1, 'Mechanical Gaming Keyboard', 5500.00, 5, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'),
(5, 2, 'Classic Denim Jacket', 3200.00, 12, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80'),
(6, 2, 'Minimalist Leather Sneakers', 4500.00, 10, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80'),
(7, 2, 'Cotton Casual Hoodie', 2200.00, 25, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80'),
(8, 2, 'UV-Protected Sunglasses', 1500.00, 18, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80'),
(9, 3, 'Organic Green Tea (200g)', 450.00, 30, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80'),
(10, 3, 'Extra Virgin Olive Oil (1L)', 1250.00, 14, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80'),
(11, 3, 'Pure Himalayan Honey (500g)', 850.00, 3, 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?w=500&q=80'),
(12, 4, 'Ergonomic Desk Chair', 12500.00, 6, 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=500&q=80'),
(13, 4, 'Modern Ceramic Table Lamp', 3100.00, 10, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80'),
(14, 4, 'Scented Soy Candle Set', 1200.00, 22, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80'),
(15, 5, 'Hardcover Hard-bound Journal', 650.00, 40, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80'),
(16, 5, 'Executive Fountain Pen', 1800.00, 15, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80'),
(17, 6, 'Hydrating Facial Moisturizer', 1600.00, 12, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80'),
(18, 6, 'Natural Vitamin C Serum', 2100.00, 4, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80');

SET FOREIGN_KEY_CHECKS = 1;
