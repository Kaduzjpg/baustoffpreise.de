import { describe, it, expect } from 'vitest';
import { haversineDistanceKm } from '../src/utils/distance';

describe('haversineDistanceKm', () => {
  it('berechnet 0 km bei identischen Koordinaten', () => {
    expect(haversineDistanceKm(52.52, 13.405, 52.52, 13.405)).toBeCloseTo(0, 5);
  });

  it('berechnet sinnvolle Distanz Berlin ↔ München (~504 km)', () => {
    const d = haversineDistanceKm(52.5200, 13.4050, 48.1351, 11.5820);
    expect(d).toBeGreaterThan(450);
    expect(d).toBeLessThan(600);
  });
});


