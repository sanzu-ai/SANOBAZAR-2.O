-- Create SANOBAZAR Database
CREATE DATABASE IF NOT EXISTS sanobazar_db;
USE sanobazar_db;

-- 1. CATEGORIES TABLE
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. ORDERS TABLE
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. ORDER_ITEMS TABLE
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SAMPLE INITIAL DATA
INSERT INTO categories (id, category_name) VALUES
(1, 'Electronics'),
(2, 'Accessories'),
(3, 'Wearables');

INSERT INTO users (full_name, email, password, role) VALUES
('Admin User', 'admin@sanobazar.com', 'admin123', 'admin'),
('John Doe', 'john@gmail.com', 'user123', 'customer');

INSERT INTO products (category_id, name, price, stock_quantity, image_url) VALUES
(1, 'Laptop', 65000.00, 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
(1, 'Wireless Headphones', 2500.00, 3, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
(2, 'Gaming Keyboard', 3500.00, 15, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'),
(3, 'Smart Watch', 4500.00, 8, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
(1, 'Bluetooth Speaker', 3000.00, 2, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400');