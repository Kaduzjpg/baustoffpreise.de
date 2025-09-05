-- Dealer Standort: POINT-Spalte und SPATIAL INDEX für effiziente Distanzabfragen
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Spalte hinzufügen (NULL erlaubt, da nicht alle Händler Geodaten haben)
ALTER TABLE Dealer
  ADD COLUMN IF NOT EXISTS location POINT SRID 4326 NULL;

-- Bestehende Daten in location übernehmen (lng, lat -> POINT)
UPDATE Dealer
SET location = ST_SRID(POINT(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- SPATIAL INDEX für location
CREATE SPATIAL INDEX IF NOT EXISTS idx_dealer_location ON Dealer (location);

-- Fallback-Index für PLZ-Präfix
CREATE INDEX IF NOT EXISTS idx_dealer_zip ON Dealer (zip);

SET FOREIGN_KEY_CHECKS=1;


