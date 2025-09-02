-- Schema: Category, Product, Dealer, DealerToCategory, Inquiry, InquiryItem, ZipGeo

CREATE TABLE IF NOT EXISTS Category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  FOREIGN KEY (category_id) REFERENCES Category(id)
);

CREATE TABLE IF NOT EXISTS Dealer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  zip VARCHAR(5) NOT NULL,
  lat DECIMAL(10,6) NULL,
  lon DECIMAL(10,6) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS DealerToCategory (
  dealer_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (dealer_id, category_id),
  FOREIGN KEY (dealer_id) REFERENCES Dealer(id),
  FOREIGN KEY (category_id) REFERENCES Category(id)
);

CREATE TABLE IF NOT EXISTS Inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NULL,
  zip VARCHAR(5) NOT NULL,
  radius_km INT NOT NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS InquiryItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  note VARCHAR(500) NULL,
  FOREIGN KEY (inquiry_id) REFERENCES Inquiry(id),
  FOREIGN KEY (product_id) REFERENCES Product(id)
);

CREATE TABLE IF NOT EXISTS ZipGeo (
  zip VARCHAR(5) PRIMARY KEY,
  lat DECIMAL(10,6) NOT NULL,
  lon DECIMAL(10,6) NOT NULL
);


