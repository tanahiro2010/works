CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  last_order_total INT NOT NULL,
  memo VARCHAR(200) NOT NULL
);

TRUNCATE TABLE products;
TRUNCATE TABLE users;
TRUNCATE TABLE customers;

INSERT INTO products (name, price) VALUES
  ('ノートPC', 89800),
  ('ワイヤレスマウス', 2980),
  ('USB-Cハブ', 4980),
  ('メカニカルキーボード', 12800);

INSERT INTO users (username, password, role) VALUES
  ('admin', 'MySQL-Admin-Pass-2026!', 'admin'),
  ('sales', 'salespw123', 'staff');

INSERT INTO customers (email, phone, last_order_total, memo) VALUES
  ('sato.customer@example.test', '090-1111-2222', 128000, '法人見積あり'),
  ('suzuki.customer@example.test', '080-3333-4444', 54800, '返品相談履歴あり'),
  ('takahashi.customer@example.test', '070-5555-6666', 23900, 'キャンペーン対象');
