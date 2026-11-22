// Genera las rutas por carretera entre comisiones médicas y la posición GPS
// simulada de cada bolsín sobre su ruta. Se corre a mano, solo cuando cambian
// las CM o los bolsines del fixture:
//
//   node scripts/generar-rutas.mjs
//
// Usa el servidor público de OSRM (OpenStreetMap). Escribe:
//   src/bolsin/fixtures/rutas.json          -> lo carga el seed en la tabla "ruta"
//   src/bolsin/fixtures/posiciones_gps.json -> lo usa el simulador de GPS
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'bolsin', 'fixtures');
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

// Avance de cada bolsín sobre su ruta (0 = CM origen, 1 = CM destino)
const AVANCE = {
  10101: 0.55,
  20202: 0.3,
  30303: 0.5,
  40404: 0.6,
  50505: 0.6,
  60606: 0.45,
  70707: 0.35,
  80808: 0.5,
  90909: 0.4,
  11111: 0.55,
  12121: 0.5,
  13131: 0.4,
  14141: 0.4,
};

const data = JSON.parse(readFileSync(join(fixtures, 'initial_data.json'), 'utf8'));
const cms = new Map(data.filter((x) => x.model === 'bolsin.cm').map((x) => [x.pk, x.fields]));
const bolsines = data.filter((x) => x.model === 'bolsin.bolsin').map((x) => x.fields);

const redondear = (n) => Math.round(n * 1e5) / 1e5;

function distanciaKm([lat1, lng1], [lat2, lng2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Punto ubicado a una fracción del largo total del recorrido. */
function puntoEnAvance(recorrido, avance) {
  const tramos = recorrido.slice(1).map((p, i) => distanciaKm(recorrido[i], p));
  let restante = tramos.reduce((a, b) => a + b, 0) * avance;
  for (let i = 0; i < tramos.length; i++) {
    if (restante <= tramos[i]) {
      const t = tramos[i] === 0 ? 0 : restante / tramos[i];
      const [a, b] = [recorrido[i], recorrido[i + 1]];
      return [redondear(a[0] + (b[0] - a[0]) * t), redondear(a[1] + (b[1] - a[1]) * t)];
    }
    restante -= tramos[i];
  }
  return recorrido[recorrido.length - 1];
}

// Douglas-Peucker: saca puntos redundantes del recorrido (tolerancia en grados, ~0.003 = 300 m)
const TOLERANCIA = 0.003;

function distanciaAlSegmento([y, x], [y1, x1], [y2, x2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const largo2 = dx * dx + dy * dy;
  const t = largo2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / largo2));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplificar(puntos, tolerancia) {
  if (puntos.length < 3) return puntos;
  const conservar = new Uint8Array(puntos.length);
  conservar[0] = conservar[puntos.length - 1] = 1;
  const pila = [[0, puntos.length - 1]];
  while (pila.length) {
    const [inicio, fin] = pila.pop();
    let maxDist = 0;
    let indice = -1;
    for (let i = inicio + 1; i < fin; i++) {
      const d = distanciaAlSegmento(puntos[i], puntos[inicio], puntos[fin]);
      if (d > maxDist) {
        maxDist = d;
        indice = i;
      }
    }
    if (maxDist > tolerancia) {
      conservar[indice] = 1;
      pila.push([inicio, indice], [indice, fin]);
    }
  }
  return puntos.filter((_, i) => conservar[i]);
}

async function calcularRuta(origen, destino) {
  const url = `${OSRM}/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=full&geometries=geojson`;
  const res = await fetch(url, { headers: { 'User-Agent': 'tpi-dsi-generar-rutas' } });
  if (!res.ok) throw new Error(`OSRM respondió ${res.status} para ${origen.codigo} → ${destino.codigo}`);
  const body = await res.json();
  const ruta = body.routes?.[0];
  if (!ruta) throw new Error(`OSRM no encontró ruta para ${origen.codigo} → ${destino.codigo}`);
  return {
    distanciaKm: Math.round(ruta.distance / 1000),
    recorrido: simplificar(ruta.geometry.coordinates.map(([lng, lat]) => [redondear(lat), redondear(lng)]), TOLERANCIA),
  };
}

const pares = [...new Set(bolsines.map((b) => `${b.origen}-${b.destino}`))];
const rutas = [];
for (const par of pares) {
  const [o, d] = par.split('-').map(Number);
  const { distanciaKm: km, recorrido } = await calcularRuta(cms.get(o), cms.get(d));
  rutas.push({ origen: o, destino: d, distanciaKm: km, recorrido });
  console.log(`${cms.get(o).codigo} → ${cms.get(d).codigo}: ${km} km, ${recorrido.length} puntos`);
  await new Promise((r) => setTimeout(r, 1100)); // límite de uso del servidor público: 1 pedido por segundo
}

const posiciones = {};
for (const b of bolsines) {
  const ruta = rutas.find((r) => r.origen === b.origen && r.destino === b.destino);
  const avance = AVANCE[b.numero_bolsin] ?? 0.5;
  const [lat, lng] = puntoEnAvance(ruta.recorrido, avance);
  posiciones[b.numero_bolsin] = { lat, lng, avance };
}

writeFileSync(join(fixtures, 'rutas.json'), JSON.stringify(rutas) + '\n');
writeFileSync(join(fixtures, 'posiciones_gps.json'), JSON.stringify(posiciones, null, 2) + '\n');
console.log(`Listo: ${rutas.length} rutas y ${Object.keys(posiciones).length} posiciones.`);
