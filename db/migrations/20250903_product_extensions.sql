-- Produkt-Erweiterungen: Varianten, Spezifikationen, Downloads, Bundles
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Varianten pro Produkt (Format/Variante/Einheit)
CREATE TABLE IF NOT EXISTS ProductVariant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  format VARCHAR(160) NULL,
  variant VARCHAR(160) NULL,
  unit VARCHAR(64) NULL,
  sku VARCHAR(120) NULL,
  imageUrl VARCHAR(255) NULL,
  CONSTRAINT fk_variant_product FOREIGN KEY (productId) REFERENCES Product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Technische Daten (global oder je Variante/Format)
CREATE TABLE IF NOT EXISTS ProductSpec (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  variantId INT NULL,
  format VARCHAR(160) NULL,
  variant VARCHAR(160) NULL,
  specKey VARCHAR(160) NOT NULL,
  specValue VARCHAR(255) NOT NULL,
  CONSTRAINT fk_spec_product FOREIGN KEY (productId) REFERENCES Product(id),
  CONSTRAINT fk_spec_variant FOREIGN KEY (variantId) REFERENCES ProductVariant(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Downloads (Datenblätter, Montageanleitungen)
CREATE TABLE IF NOT EXISTS ProductDownload (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  url VARCHAR(512) NOT NULL,
  CONSTRAINT fk_download_product FOREIGN KEY (productId) REFERENCES Product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Häufig zusammen angefragt (Bundles)
CREATE TABLE IF NOT EXISTS ProductBundle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  relatedProductId INT NOT NULL,
  sort INT DEFAULT 0,
  CONSTRAINT fk_bundle_product FOREIGN KEY (productId) REFERENCES Product(id),
  CONSTRAINT fk_bundle_related FOREIGN KEY (relatedProductId) REFERENCES Product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;








