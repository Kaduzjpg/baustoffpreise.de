-- Beispielprodukte je Hauptkategorie
-- Ausführen (HeidiSQL oder CLI über SSH-Tunnel):
-- mysql -h 127.0.0.1 -P 3307 -u appuser -p appdb < db/seed_products_examples.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Rohbau
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Zement CEM II 25kg', 'zement-cem-ii-25kg', 'Sack', NULL,
       'Universeller Portlandkompositzement für Estrich- und Betonarbeiten.',
       'zement, rohbau, estrich, beton'
FROM categories c WHERE c.slug='rohbau' AND c.parent_id IS NULL;

-- Dach & Fassade
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Dachziegel Ton naturrot', 'dachziegel-ton-naturrot', 'Stück', NULL,
       'Hochwertiger Tondachziegel in Naturrot, passend für Steildächer.',
       'dachziegel, dach, fassade, ton'
FROM categories c WHERE c.slug='dach-fassade' AND c.parent_id IS NULL;

-- Innenausbau
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Gipskartonplatte 12,5 mm', 'gipskartonplatte-12-5', 'm²', NULL,
       'Standard-GK-Platte für Trockenbauwände und Decken.',
       'gipskarton, innenausbau, trockenbau'
FROM categories c WHERE c.slug='innenausbau' AND c.parent_id IS NULL;

-- Bodenbeläge & Fliesen
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Feinsteinzeug 60x60 cm', 'feinsteinzeug-60x60', 'm²', NULL,
       'Rutschhemmende Feinsteinzeugfliese 60x60 cm, rektifiziert.',
       'fliese, boden, feinsteinzeug'
FROM categories c WHERE c.slug='boden-fliessen' AND c.parent_id IS NULL;

-- Garten & Landschaftsbau
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Terrassenplatte Beton 40x40', 'terrassenplatte-beton-40x40', 'm²', NULL,
       'Frostsichere Betonplatte für Terrassen und Wege.',
       'terrassenplatte, garten, landschaftsbau'
FROM categories c WHERE c.slug='garten-landschaft' AND c.parent_id IS NULL;

-- Holz & Türen
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'OSB 3 Platte 18 mm', 'osb3-platte-18mm', 'm²', NULL,
       'Feuchtigkeitsbeständige OSB 3 Platte für tragende Zwecke.',
       'osb, holz, platte, tueren'
FROM categories c WHERE c.slug='holz-tueren' AND c.parent_id IS NULL;

-- Fenster & Sonnenschutz
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'PVC-Fenster 1,23 x 1,48 m', 'pvc-fenster-123x148', 'Stück', NULL,
       'Wärmeschutzfenster mit 3-fach Verglasung, weiß.',
       'fenster, pvc, sonnenschutz'
FROM categories c WHERE c.slug='fenster-sonnenschutz' AND c.parent_id IS NULL;

-- Sanitär & Heizung
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'WC-Komplettset Tiefspüler', 'wc-komplettset-tiefspueler', 'Stück', NULL,
       'Spülrandloses WC mit passendem Sitz und Unterputzspülkasten.',
       'wc, sanitär, heizung'
FROM categories c WHERE c.slug='sanitaer-heizung' AND c.parent_id IS NULL;

-- Werkzeuge & Baugeräte
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Bohrhammer 1500 W SDS-Max', 'bohrhammer-1500w-sdsmax', 'Stück', NULL,
       'Leistungsstarker Bohr- und Meißelhammer für Beton.',
       'bohrhammer, werkzeuge, baugeraete'
FROM categories c WHERE c.slug='werkzeuge-baugeraete' AND c.parent_id IS NULL;

-- Tiefbau
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'KG Rohr DN110', 'kg-rohr-dn110', 'lfm', NULL,
       'Abwasserrohr KG DN110, für Erdverlegung.',
       'kg, rohr, tiefbau, kanal'
FROM categories c WHERE c.slug='tiefbau' AND c.parent_id IS NULL;

-- Schüttgüter
INSERT IGNORE INTO Product (categoryId, name, slug, unit, imageUrl, description, keywords)
SELECT c.id, 'Splitt 2–5 mm lose', 'splitt-2-5mm', 't', NULL,
       'Körnung 2–5 mm, geeignet für Wege und Drainagen.',
       'schuettgueter, splitt, kies'
FROM categories c WHERE c.slug='schuettgueter' AND c.parent_id IS NULL;

SET FOREIGN_KEY_CHECKS=1;





