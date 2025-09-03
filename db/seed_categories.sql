-- Seed: Hierarchische Kategorien (categories mit parent_id)
-- Voraussetzung: Datenbank appdb, Tabelle categories mit Spalten (id, name, slug, parent_id, level, full_slug)
-- Ausführung: per HeidiSQL (SQL-Editor) oder CLI: 
-- mysql -h 127.0.0.1 -P 3307 -u root -p appdb < db/seed_categories.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Top-Level Kategorien (level 0)
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug) VALUES
('Baustoffe & Rohbau', 'rohbau', NULL, 0, 'rohbau'),
('Dach & Fassade', 'dach-fassade', NULL, 0, 'dach-fassade'),
('Innenausbau', 'innenausbau', NULL, 0, 'innenausbau'),
('Bodenbeläge & Fliesen', 'boden-fliessen', NULL, 0, 'boden-fliessen'),
('Garten & Landschaftsbau', 'garten-landschaft', NULL, 0, 'garten-landschaft'),
('Holz & Türen', 'holz-tueren', NULL, 0, 'holz-tueren'),
('Fenster & Sonnenschutz', 'fenster-sonnenschutz', NULL, 0, 'fenster-sonnenschutz'),
('Sanitär & Heizung', 'sanitaer-heizung', NULL, 0, 'sanitaer-heizung'),
('Werkzeuge & Baugeräte', 'werkzeuge-baugeraete', NULL, 0, 'werkzeuge-baugeraete'),
('Tiefbau', 'tiefbau', NULL, 0, 'tiefbau'),
('Schüttgüter', 'schuettgueter', NULL, 0, 'schuettgueter');

-- Rohbau → Kinder (level 1)
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM ( 
  SELECT 'Mauersteine (Ziegel, Kalksandstein, Porenbeton)' AS name, 'mauersteine' AS slug UNION ALL
  SELECT 'Beton & Estrich' AS name, 'beton-estrich' AS slug UNION ALL
  SELECT 'Dämmstoffe (Perimeter, Keller, Fassade)' AS name, 'daemmstoffe-perimeter-keller-fassade' AS slug UNION ALL
  SELECT 'Mörtel, Putze & Zemente' AS name, 'moertel-putze-zemente' AS slug
) AS v JOIN categories p ON p.slug='rohbau';

-- Dach & Fassade → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Dachziegel & Dachsteine' AS name, 'dachziegel-dachsteine' AS slug UNION ALL
  SELECT 'Dachabdichtung & Folien' AS name, 'dachabdichtung-folien' AS slug UNION ALL
  SELECT 'Fassadenverkleidung (Putz, Paneele)' AS name, 'fassadenverkleidung-putz-paneele' AS slug UNION ALL
  SELECT 'Dachrinnen & Entwässerung' AS name, 'dachrinnen-entwaesserung' AS slug
) AS v JOIN categories p ON p.slug='dach-fassade';

-- Innenausbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Trockenbauplatten (Gipskarton, OSB)' AS name, 'trockenbauplatten' AS slug UNION ALL
  SELECT 'Dämmung Innenbereich' AS name, 'daemmung-innenbereich' AS slug UNION ALL
  SELECT 'Spachtel & Innenputze' AS name, 'spachtel-innenputze' AS slug UNION ALL
  SELECT 'Profile & Zubehör' AS name, 'profile-zubehoer' AS slug
) AS v JOIN categories p ON p.slug='innenausbau';

-- Bodenbeläge & Fliesen → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Fliesen & Platten' AS name, 'fliesen-platten' AS slug UNION ALL
  SELECT 'Laminat & Vinyl' AS name, 'laminat-vinyl' AS slug UNION ALL
  SELECT 'Parkett' AS name, 'parkett' AS slug UNION ALL
  SELECT 'Verlegezubehör (Kleber, Fugenmasse)' AS name, 'verlegezubehoer' AS slug
) AS v JOIN categories p ON p.slug='boden-fliessen';

-- Garten & Landschaftsbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Pflastersteine & Terrassenplatten' AS name, 'pflaster-terrassenplatten' AS slug UNION ALL
  SELECT 'Zäune & Sichtschutz' AS name, 'zaeune-sichtschutz' AS slug UNION ALL
  SELECT 'Gartenhäuser & Carports' AS name, 'gartenhaeuser-carports' AS slug UNION ALL
  SELECT 'Gabionen & Mauersteine' AS name, 'gabionen-mauersteine' AS slug
) AS v JOIN categories p ON p.slug='garten-landschaft';

-- Holz & Türen → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Konstruktionsholz & Platten' AS name, 'konstruktionsholz-platten' AS slug UNION ALL
  SELECT 'Innentüren' AS name, 'innentueren' AS slug UNION ALL
  SELECT 'Haustüren' AS name, 'haustueren' AS slug UNION ALL
  SELECT 'Zargen & Beschläge' AS name, 'zargen-beschlaege' AS slug
) AS v JOIN categories p ON p.slug='holz-tueren';

-- Fenster & Sonnenschutz → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Kunststofffenster' AS name, 'kunststofffenster' AS slug UNION ALL
  SELECT 'Holz- & Alufenster' AS name, 'holz-alu-fenster' AS slug UNION ALL
  SELECT 'Rollläden & Raffstores' AS name, 'rolllaeden-raffstores' AS slug UNION ALL
  SELECT 'Markisen & Insektenschutz' AS name, 'markisen-insektenschutz' AS slug
) AS v JOIN categories p ON p.slug='fenster-sonnenschutz';

-- Sanitär & Heizung → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Badkeramik (WC, Waschbecken, Duschen)' AS name, 'badkeramik' AS slug UNION ALL
  SELECT 'Armaturen' AS name, 'armaturen' AS slug UNION ALL
  SELECT 'Heizkörper & Fußbodenheizung' AS name, 'heizkoerper-fussbodenheizung' AS slug UNION ALL
  SELECT 'Installationsmaterial (Rohre, Fittings)' AS name, 'installationsmaterial' AS slug
) AS v JOIN categories p ON p.slug='sanitaer-heizung';

-- Werkzeuge & Baugeräte → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Handwerkzeuge' AS name, 'handwerkzeuge' AS slug UNION ALL
  SELECT 'Elektrowerkzeuge' AS name, 'elektrowerkzeuge' AS slug UNION ALL
  SELECT 'Maschinen & Baugeräte' AS name, 'maschinen-baugeraete' AS slug UNION ALL
  SELECT 'Arbeitsschutz (Helme, Handschuhe, Schutzbrillen)' AS name, 'arbeitsschutz' AS slug
) AS v JOIN categories p ON p.slug='werkzeuge-baugeraete';

-- Tiefbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Entwässerung (KG-Rohre, Schächte)' AS name, 'entwaesserung' AS slug UNION ALL
  SELECT 'Kanal- & Rohrsysteme' AS name, 'kanal-rohrsysteme' AS slug UNION ALL
  SELECT 'Straßenbauprodukte (Bordsteine, Rinnensteine)' AS name, 'strassenbauprodukte' AS slug UNION ALL
  SELECT 'Geotextilien & Trennvliese' AS name, 'geotextilien-trennvliese' AS slug
) AS v JOIN categories p ON p.slug='tiefbau';

-- Schüttgüter → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Kies & Splitt' AS name, 'kies-splitt' AS slug UNION ALL
  SELECT 'Sand & Füllstoffe' AS name, 'sand-fuellstoffe' AS slug UNION ALL
  SELECT 'Schotter' AS name, 'schotter' AS slug UNION ALL
  SELECT 'Recyclingmaterial (RC-Material, Mineralgemisch)' AS name, 'recyclingmaterial' AS slug
) AS v JOIN categories p ON p.slug='schuettgueter';

SET FOREIGN_KEY_CHECKS=1;


