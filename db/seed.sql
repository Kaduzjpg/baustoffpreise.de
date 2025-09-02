INSERT INTO Category (name, slug) VALUES
('Sand','sand'),('Kies','kies'),('Splitt','splitt'),('Schotter','schotter'),('Pflastersteine','pflastersteine'),('Beton','beton'),('Ziegel','ziegel'),('Dämmung','dämmung');

INSERT INTO Product (category_id, name, slug) VALUES
(1,'Malsand 0-2','malsand'),(1,'Betonsand 0-4','betonsand'),
(2,'Kies 8/16','kies-8-16'),(2,'Kies 16/32','kies-16-32'),
(3,'Splitt 2/5','splitt-2-5'),(3,'Splitt 8/11','splitt-8-11'),
(4,'Schotter 32/56','schotter-32-56'),(4,'Schotter 45/80','schotter-45-80'),
(5,'Pflasterstein Grau','pflaster-grau'),(5,'Pflasterstein Anthrazit','pflaster-anthrazit'),
(6,'Beton C20/25','beton-c20'),(6,'Beton C25/30','beton-c25'),
(7,'Mauerziegel','ziegel-mauer'),(7,'Dachziegel','ziegel-dach'),
(8,'Dämmung EPS','daemmung-eps'),(8,'Dämmung XPS','daemmung-xps');

INSERT INTO Dealer (name, email, zip, lat, lon, active) VALUES
('Muster Baustoffe GmbH','dealer1@example.com','81675',48.1391,11.5860,1),
('Bayern Bauhandel','dealer2@example.com','80331',48.1374,11.5755,1),
('Isar Steine KG','dealer3@example.com','85748',48.2486,11.6520,1),
('Alpen Kieswerke','dealer4@example.com','83646',47.7079,11.8193,1),
('Donau Ziegel AG','dealer5@example.com','93047',49.0195,12.0982,1);

INSERT INTO DealerToCategory (dealer_id, category_id)
SELECT d.id, c.id FROM Dealer d CROSS JOIN Category c WHERE d.id <= 3
UNION ALL
SELECT 4, 2 UNION ALL SELECT 4, 4 UNION ALL SELECT 4, 6
UNION ALL
SELECT 5, 5 UNION ALL SELECT 5, 7;

-- Minimal ZipGeo seeds (Beispiele)
INSERT INTO ZipGeo (zip, lat, lon) VALUES
('81675',48.1391,11.5860),
('80331',48.1374,11.5755),
('85748',48.2486,11.6520),
('83646',47.7079,11.8193),
('93047',49.0195,12.0982);
