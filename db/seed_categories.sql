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
  SELECT 'Beton & Estrich', 'beton-estrich' UNION ALL
  SELECT 'Dämmstoffe (Perimeter, Keller, Fassade)', 'daemmstoffe-perimeter-keller-fassade' UNION ALL
  SELECT 'Mörtel, Putze & Zemente', 'moertel-putze-zemente'
) v(name, slug) JOIN categories p ON p.slug='rohbau';

-- Dach & Fassade → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Dachziegel & Dachsteine', 'dachziegel-dachsteine' UNION ALL
  SELECT 'Dachabdichtung & Folien', 'dachabdichtung-folien' UNION ALL
  SELECT 'Fassadenverkleidung (Putz, Paneele)', 'fassadenverkleidung-putz-paneele' UNION ALL
  SELECT 'Dachrinnen & Entwässerung', 'dachrinnen-entwaesserung'
) v(name, slug) JOIN categories p ON p.slug='dach-fassade';

-- Innenausbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Trockenbauplatten (Gipskarton, OSB)', 'trockenbauplatten' UNION ALL
  SELECT 'Dämmung Innenbereich', 'daemmung-innenbereich' UNION ALL
  SELECT 'Spachtel & Innenputze', 'spachtel-innenputze' UNION ALL
  SELECT 'Profile & Zubehör', 'profile-zubehoer'
) v(name, slug) JOIN categories p ON p.slug='innenausbau';

-- Bodenbeläge & Fliesen → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Fliesen & Platten', 'fliesen-platten' UNION ALL
  SELECT 'Laminat & Vinyl', 'laminat-vinyl' UNION ALL
  SELECT 'Parkett', 'parkett' UNION ALL
  SELECT 'Verlegezubehör (Kleber, Fugenmasse)', 'verlegezubehoer'
) v(name, slug) JOIN categories p ON p.slug='boden-fliessen';

-- Garten & Landschaftsbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Pflastersteine & Terrassenplatten', 'pflaster-terrassenplatten' UNION ALL
  SELECT 'Zäune & Sichtschutz', 'zaeune-sichtschutz' UNION ALL
  SELECT 'Gartenhäuser & Carports', 'gartenhaeuser-carports' UNION ALL
  SELECT 'Gabionen & Mauersteine', 'gabionen-mauersteine'
) v(name, slug) JOIN categories p ON p.slug='garten-landschaft';

-- Holz & Türen → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Konstruktionsholz & Platten', 'konstruktionsholz-platten' UNION ALL
  SELECT 'Innentüren', 'innentueren' UNION ALL
  SELECT 'Haustüren', 'haustueren' UNION ALL
  SELECT 'Zargen & Beschläge', 'zargen-beschlaege'
) v(name, slug) JOIN categories p ON p.slug='holz-tueren';

-- Fenster & Sonnenschutz → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Kunststofffenster', 'kunststofffenster' UNION ALL
  SELECT 'Holz- & Alufenster', 'holz-alu-fenster' UNION ALL
  SELECT 'Rollläden & Raffstores', 'rolllaeden-raffstores' UNION ALL
  SELECT 'Markisen & Insektenschutz', 'markisen-insektenschutz'
) v(name, slug) JOIN categories p ON p.slug='fenster-sonnenschutz';

-- Sanitär & Heizung → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Badkeramik (WC, Waschbecken, Duschen)', 'badkeramik' UNION ALL
  SELECT 'Armaturen', 'armaturen' UNION ALL
  SELECT 'Heizkörper & Fußbodenheizung', 'heizkoerper-fussbodenheizung' UNION ALL
  SELECT 'Installationsmaterial (Rohre, Fittings)', 'installationsmaterial'
) v(name, slug) JOIN categories p ON p.slug='sanitaer-heizung';

-- Werkzeuge & Baugeräte → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Handwerkzeuge', 'handwerkzeuge' UNION ALL
  SELECT 'Elektrowerkzeuge', 'elektrowerkzeuge' UNION ALL
  SELECT 'Maschinen & Baugeräte', 'maschinen-baugeraete' UNION ALL
  SELECT 'Arbeitsschutz (Helme, Handschuhe, Schutzbrillen)', 'arbeitsschutz'
) v(name, slug) JOIN categories p ON p.slug='werkzeuge-baugeraete';

-- Tiefbau → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Entwässerung (KG-Rohre, Schächte)', 'entwaesserung' UNION ALL
  SELECT 'Kanal- & Rohrsysteme', 'kanal-rohrsysteme' UNION ALL
  SELECT 'Straßenbauprodukte (Bordsteine, Rinnensteine)', 'strassenbauprodukte' UNION ALL
  SELECT 'Geotextilien & Trennvliese', 'geotextilien-trennvliese'
) v(name, slug) JOIN categories p ON p.slug='tiefbau';

-- Schüttgüter → Kinder
INSERT IGNORE INTO categories (name, slug, parent_id, level, full_slug)
SELECT v.name, v.slug, p.id, 1, CONCAT(p.slug,'/',v.slug)
FROM (
  SELECT 'Kies & Splitt', 'kies-splitt' UNION ALL
  SELECT 'Sand & Füllstoffe', 'sand-fuellstoffe' UNION ALL
  SELECT 'Schotter', 'schotter' UNION ALL
  SELECT 'Recyclingmaterial (RC-Material, Mineralgemisch)', 'recyclingmaterial'
) v(name, slug) JOIN categories p ON p.slug='schuettgueter';

SET FOREIGN_KEY_CHECKS=1;


