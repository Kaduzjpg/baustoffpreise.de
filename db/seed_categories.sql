-- Seed: Hauptkategorien und Unterkategorien
-- Voraussetzung: Datenbank appdb, Tabelle categories vorhanden
-- Ausführung: per HeidiSQL (SQL-Editor) oder CLI: 
-- mysql -h 127.0.0.1 -P 3307 -u root -p appdb < db/seed_categories.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Unterkategorie-Tabelle anlegen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS Subcategory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoryId INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  CONSTRAINT fk_subcategory_category FOREIGN KEY (categoryId) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Hauptkategorien (INSERT IGNORE, um Duplikate zu vermeiden)
INSERT IGNORE INTO categories (name, slug)
VALUES
('Baustoffe & Rohbau', 'rohbau'),
('Dach & Fassade', 'dach-fassade'),
('Innenausbau', 'innenausbau'),
('Bodenbeläge & Fliesen', 'boden-fliessen'),
('Garten & Landschaftsbau', 'garten-landschaft'),
('Holz & Türen', 'holz-tueren'),
('Fenster & Sonnenschutz', 'fenster-sonnenschutz'),
('Sanitär & Heizung', 'sanitaer-heizung'),
('Werkzeuge & Baugeräte', 'werkzeuge-baugeraete');

-- Helper: hole Kategorie-ID per Slug
DROP TEMPORARY TABLE IF EXISTS _cat;
CREATE TEMPORARY TABLE _cat AS SELECT id, slug FROM categories;

-- Rohbau
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Zement, Mörtel & Beton' AS name, 'zement-moertel-beton' AS slug UNION ALL
  SELECT 'Mauerwerk (Ziegel, Kalksandstein, Porenbeton)', 'mauerwerk' UNION ALL
  SELECT 'Bewehrung & Baustahl', 'bewehrung-baustahl' UNION ALL
  SELECT 'Schalung & Bauholz', 'schalung-bauholz'
) v ON c.slug='rohbau';

-- Dach & Fassade
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Dachziegel & Dachsteine' AS name, 'dachziegel-dachsteine' AS slug UNION ALL
  SELECT 'Dachabdichtung & Dämmung', 'dachabdichtung-daemmung' UNION ALL
  SELECT 'Fassadenverkleidung (Putz, Klinker, Paneele)', 'fassadenverkleidung' UNION ALL
  SELECT 'Dachrinnen & Entwässerung', 'dachrinnen-entwaesserung'
) v ON c.slug='dach-fassade';

-- Innenausbau
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Trockenbauplatten & Profile' AS name, 'trockenbauplatten-profile' AS slug UNION ALL
  SELECT 'Innenputze & Spachtelmassen' AS name, 'innenputze-spachtel' AS slug UNION ALL
  SELECT 'Dämmstoffe (Mineralwolle, Holzfaser, Hartschaum)' AS name, 'daemmstoffe' AS slug UNION ALL
  SELECT 'Decken- & Wandverkleidungen' AS name, 'decken-wandverkleidungen' AS slug
) v ON c.slug='innenausbau';

-- Bodenbeläge & Fliesen
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Fliesen & Naturstein' AS name, 'fliesen-naturstein' AS slug UNION ALL
  SELECT 'Laminat, Vinyl & Parkett' AS name, 'laminat-vinyl-parkett' AS slug UNION ALL
  SELECT 'Estrich & Bodenausgleich' AS name, 'estrich-bodenausgleich' AS slug UNION ALL
  SELECT 'Teppich & textile Beläge' AS name, 'teppich-textil' AS slug
) v ON c.slug='boden-fliessen';

-- Garten & Landschaftsbau
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Pflastersteine & Terrassenplatten' AS name, 'pflaster-terrasse' AS slug UNION ALL
  SELECT 'Zäune & Sichtschutz' AS name, 'zaeune-sichtschutz' AS slug UNION ALL
  SELECT 'Gartenholz (Carports, Pergolen, Gartenhäuser)' AS name, 'gartenholz' AS slug UNION ALL
  SELECT 'Gabionen & Steinkörbe' AS name, 'gabionen' AS slug
) v ON c.slug='garten-landschaft';

-- Holz & Türen
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Bauholz & Konstruktionsholz' AS name, 'bauholz' AS slug UNION ALL
  SELECT 'Türen (Innentüren & Haustüren)' AS name, 'tueren' AS slug UNION ALL
  SELECT 'Fensterbänke & Verkleidungen' AS name, 'fensterbaenke' AS slug UNION ALL
  SELECT 'Treppen & Geländer' AS name, 'treppen-gelaender' AS slug
) v ON c.slug='holz-tueren';

-- Fenster & Sonnenschutz
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Fenster (Kunststoff, Holz, Alu)' AS name, 'fenster' AS slug UNION ALL
  SELECT 'Rollläden & Raffstores' AS name, 'rolllaeden-raffstores' AS slug UNION ALL
  SELECT 'Markisen & Sonnensegel' AS name, 'markisen-sonnensegel' AS slug UNION ALL
  SELECT 'Insektenschutz' AS name, 'insektenschutz' AS slug
) v ON c.slug='fenster-sonnenschutz';

-- Sanitär & Heizung
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Badkeramik & Armaturen' AS name, 'badkeramik-armaturen' AS slug UNION ALL
  SELECT 'Heizkörper & Fußbodenheizung' AS name, 'heizkoerper-fbh' AS slug UNION ALL
  SELECT 'Rohrsysteme & Installation' AS name, 'rohrsysteme' AS slug UNION ALL
  SELECT 'Wärmepumpen & Solartechnik' AS name, 'waermepumpen-solar' AS slug
) v ON c.slug='sanitaer-heizung';

-- Werkzeuge & Baugeräte
INSERT IGNORE INTO Subcategory (categoryId, name, slug)
SELECT c.id, v.name, v.slug FROM _cat c
JOIN (
  SELECT 'Elektrowerkzeuge (Bohrmaschine, Winkelschleifer)' AS name, 'elektrowerkzeuge' AS slug UNION ALL
  SELECT 'Handwerkzeuge (Hammer, Schraubendreher, Zangen)' AS name, 'handwerkzeuge' AS slug UNION ALL
  SELECT 'Baugeräte (Mischer, Rüttelplatte, Gerüst)' AS name, 'baugeraete' AS slug UNION ALL
  SELECT 'Arbeitsschutz (Helme, Handschuhe, Schuhe)' AS name, 'arbeitsschutz' AS slug
) v ON c.slug='werkzeuge-baugeraete';

SET FOREIGN_KEY_CHECKS=1;


