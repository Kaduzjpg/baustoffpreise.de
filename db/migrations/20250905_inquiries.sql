-- Anfrage-Persistenz: Inquiry, InquiryItem und Benachrichtigungs-Logs
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS Inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerEmail VARCHAR(255) NOT NULL,
  customerName VARCHAR(160) NOT NULL,
  customerPhone VARCHAR(64) NULL,
  customerZip VARCHAR(10) NOT NULL,
  customerStreet VARCHAR(160) NOT NULL,
  customerCity VARCHAR(120) NOT NULL,
  radiusKm INT NOT NULL,
  message TEXT NULL,
  lat DOUBLE NULL,
  lng DOUBLE NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS InquiryItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiryId INT NOT NULL,
  productId INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  note VARCHAR(255) NULL,
  CONSTRAINT fk_inquiry_item_inquiry FOREIGN KEY (inquiryId) REFERENCES Inquiry(id) ON DELETE CASCADE,
  INDEX idx_inquiryItem_inquiry (inquiryId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS InquiryDealerNotification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiryId INT NOT NULL,
  dealerId INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('queued','sent','failed') NOT NULL DEFAULT 'sent',
  error TEXT NULL,
  CONSTRAINT fk_inquiry_notif_inquiry FOREIGN KEY (inquiryId) REFERENCES Inquiry(id) ON DELETE CASCADE,
  INDEX idx_inquiry_notif_inquiry (inquiryId),
  INDEX idx_inquiry_notif_dealer (dealerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;


