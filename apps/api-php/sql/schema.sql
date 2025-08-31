-- Minimales Schema (MariaDB/MySQL)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  attrs JSON NULL,
  price_hint DECIMAL(10,2) NULL,
  image_url VARCHAR(255) NULL,
  searchable_text TEXT,
  FULLTEXT KEY ft_search (searchable_text),
  KEY idx_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dealers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  plz VARCHAR(5) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  radius_km INT NOT NULL DEFAULT 50,
  KEY idx_plz (plz),
  KEY idx_lat_lng (lat, lng)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS postal_codes (
  plz VARCHAR(5) PRIMARY KEY,
  town VARCHAR(120) NULL,
  state VARCHAR(80) NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_email VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(60) NULL,
  zip VARCHAR(5) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(40) NOT NULL DEFAULT 'open'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS request_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  note VARCHAR(255) NULL,
  KEY idx_request (request_id),
  KEY idx_product (product_id),
  CONSTRAINT fk_req_items_req FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_req_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;
