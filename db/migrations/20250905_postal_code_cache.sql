-- PostalCode Cache Tabelle
CREATE TABLE IF NOT EXISTS `PostalCode` (
  `zip` VARCHAR(5) NOT NULL,
  `city` VARCHAR(120) NULL,
  `lat` DOUBLE NULL,
  `lng` DOUBLE NULL,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`zip`),
  KEY `idx_postalcode_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


