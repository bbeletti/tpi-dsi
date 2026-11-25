import posicionesGps from '../fixtures/posiciones_gps.json';

// Última posición reportada por el GPS de cada bolsín (simula los dispositivos reales).
// La genera scripts/generar-rutas.mjs: cada bolsín está sobre la ruta entre su CM
// origen y su CM destino, según su porcentaje de avance.
const POSICIONES_GPS: Record<string, { lat: number; lng: number }> =
  posicionesGps;

function posicionDe(numeroBolsin: number) {
  const posicion = POSICIONES_GPS[String(numeroBolsin)];
  if (!posicion) {
    // A3: el dispositivo no reporta ubicación para este bolsín
    throw new Error(`Sin reporte de ubicación para el bolsín ${numeroBolsin}`);
  }
  return posicion;
}

/**
 * Simula los endpoints de los tres modelos de GPS Tracker (ERS, CU 36 - Observación 1).
 * Representa a los sistemas externos; no es parte del dominio.
 */
export class GpsTracker {
  // XTR-4500L: returns JSON string
  static getBolsinLocation(
    apiKey: string,
    numeroBolsin: number,
    cmOrigenCodigo: string,
  ): string {
    const { lat, lng } = posicionDe(numeroBolsin);
    const updateTime = new Date().toISOString();
    return JSON.stringify([
      {
        numeroBolsin,
        latitud: lat,
        longitud: lng,
        fechaHora: updateTime,
      },
    ]);
  }

  // NavTrack QX-7A: returns comma separated values
  static retrieveTrackingData(
    apiKey: string,
    numeroBolsin: number,
    cmDestinoCodigo: string,
  ): string {
    const { lat, lng } = posicionDe(numeroBolsin);
    const updateTime = new Date().toISOString();
    return `${numeroBolsin},${lat},${lng},${updateTime}`;
  }

  // GeoPulse MTR-900: returns a matrix
  static fetchCargoPositions(
    apiKey: string,
    numeroBolsin: number,
  ): (number | string)[][] {
    const { lat, lng } = posicionDe(numeroBolsin);
    const updateTime = new Date().toISOString();
    return [[numeroBolsin, lat, lng, updateTime]];
  }
}
