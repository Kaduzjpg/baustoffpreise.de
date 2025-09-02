import { dbPool } from './db';
import type { RowDataPacket } from 'mysql2';

export type Dealer = {
  id: number;
  name: string;
  email: string;
  zip: string;
  lat: number | null;
  lon: number | null;
};

export type ZipGeo = { zip: string; lat: number; lon: number } | null;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371; // km
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export async function findZipGeo(zip: string): Promise<ZipGeo> {
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT zip, lat, lon FROM ZipGeo WHERE zip = ? LIMIT 1',
    [zip]
  );
  if (rows.length) {
    const r = rows[0] as RowDataPacket & { zip: string; lat: number; lon: number };
    return { zip: r.zip, lat: Number(r.lat), lon: Number(r.lon) };
  }
  return null;
}

export async function fetchDealers(): Promise<Dealer[]> {
  const [rows] = await dbPool.query<RowDataPacket[]>(
    'SELECT id, name, email, zip, lat, lon FROM Dealer WHERE active = 1'
  );
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    zip: String(r.zip),
    lat: r.lat == null ? null : Number(r.lat),
    lon: r.lon == null ? null : Number(r.lon),
  }));
}

export async function matchDealersByZipRadius(zip: string, radiusKm: number): Promise<Dealer[]> {
  const center = await findZipGeo(zip);
  const dealers = await fetchDealers();
  if (center) {
    const withCoords = dealers.filter((d): d is Dealer & { lat: number; lon: number } => d.lat != null && d.lon != null);
    const nearby = withCoords.filter((d) => haversineKm({ lat: center.lat, lon: center.lon }, { lat: d.lat as number, lon: d.lon as number }) <= radiusKm);
    return nearby.slice(0, 100);
  }
  // Fallback: PLZ-Heuristik (gleiche ersten 2-3 Ziffern bevorzugen)
  const prefix3 = zip.slice(0, 3);
  const prefix2 = zip.slice(0, 2);
  const candidates = dealers.filter((d) => d.zip.startsWith(prefix3) || d.zip.startsWith(prefix2));
  return candidates.slice(0, 50);
}


