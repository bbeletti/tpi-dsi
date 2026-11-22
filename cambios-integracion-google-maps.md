# Cambios: integración de Google Maps en el seguimiento

Este documento describe los cambios realizados para reemplazar el radar dibujado en un `<canvas>` por Google Maps en la vista de seguimiento de bolsines.

## Resumen funcional

La vista de seguimiento ahora utiliza el componente oficial `@angular/google-maps`. Muestra las Comisiones Médicas (CM) y los bolsines en tránsito como marcadores sobre un mapa real. Los filtros por número de precinto y CM destino continúan aplicándose a la lista y a los marcadores de bolsines; al seleccionar uno, desde el mapa o desde la lista, se conserva su detalle. Las posiciones de los bolsines se vuelven a consultar cada 10 segundos.

## Cambios realizados

### Integración de Google Maps en Angular

- **`frontend/package.json` y `frontend/package-lock.json`**: agregan `@angular/google-maps`, el paquete que proporciona los componentes oficiales `<google-map>` y `<map-marker>`.
- **`frontend/src/app/views/seguimiento.ts`**: importa `GoogleMapsModule` y prepara los datos del mapa: centro inicial, opciones, coordenadas de las CM con ubicación válida e iconos distintos para CM, bolsines y bolsín seleccionado. Se conserva la consulta periódica del seguimiento cada 10 segundos y el filtrado por precinto y destino.
- **`frontend/src/app/views/seguimiento.html`**: reemplaza el `<canvas>` por `<google-map>`. Renderiza un marcador por CM con coordenadas y uno por cada bolsín que coincide con los filtros. El evento de clic del marcador selecciona el bolsín y actualiza el detalle existente. Si el mapa aún no está listo o no puede mostrarse, presenta un mensaje de carga o de error.
- **`frontend/src/app/services/google-maps-loader.service.ts`**: carga dinámicamente la Maps JavaScript API una sola vez, usando la API key obtenida de la configuración del backend. Informa los errores de carga al componente.
- **`frontend/src/app/services/api.service.ts`**: añade las consultas al endpoint de configuración del mapa y al endpoint existente de Comisiones Médicas.
- **`frontend/src/app/models.ts`**: agrega `latitud` y `longitud` al tipo `CM` para reflejar los datos que ahora proporciona el backend.
- **`frontend/src/styles.css`**: adapta el contenedor del mapa y define la presentación del mensaje de carga o error.

Se eliminó la lógica anterior del canvas: conversión manual de coordenadas a píxeles, dibujo del radar y detección manual de clics sobre los puntos.

### API key y configuración

- **`backend/src/app.controller.ts`**: añade `GET /api/config/google-maps`, que lee `GOOGLE_MAPS_API_KEY` del entorno y devuelve su valor al frontend en tiempo de ejecución.
- **`README.md`**: documenta la variable de entorno y recomienda restringir la key web por los dominios o referrers autorizados en Google Cloud, además de habilitar Maps JavaScript API.

La API key no se guarda en el código fuente ni se incorpora durante la compilación del frontend. Como el navegador necesita usarla para solicitar Google Maps, la clave será visible en el navegador cuando se cargue el mapa: no debe tratarse como secreta y debe restringirse en Google Cloud.

### Coordenadas de las Comisiones Médicas

- **`backend/src/bolsin/entities/cm.entity.ts`**: añade los campos `latitud` y `longitud` a la entidad CM. Se permiten valores nulos para registros que todavía no tengan coordenadas.
- **`backend/src/bolsin/fixtures/initial_data.json`**: agrega las coordenadas de las tres CM del seed (CM-01, CM-02 y CM-03).
- **`backend/src/seed.ts`**: copia las coordenadas de las fixtures al insertar las CM en la base de datos.

La vista utiliza el endpoint existente `GET /api/cms` para obtener las coordenadas desde el backend; no mantiene una lista duplicada de ubicaciones en el código del frontend.

### Pruebas y guía del proyecto

- **`backend/src/app.controller.spec.ts`**: incorpora los providers requeridos para probar el controlador y un test que verifica la respuesta del endpoint de configuración de Google Maps.
- **`README.md`**: actualiza la descripción del seguimiento para reflejar que se usa Google Maps en lugar de un plano Canvas.

## Configuración y ejecución

1. Define `GOOGLE_MAPS_API_KEY` en el entorno utilizado por el backend. En Docker Compose, el backend toma las variables del archivo `.env` de la raíz, que está excluido del repositorio.
2. En Google Cloud, habilita Maps JavaScript API y restringe la API key a los referrers autorizados.
3. Inicia el backend y frontend de acuerdo con las instrucciones del README.
4. Si la base de datos ya existía antes de añadir las columnas, reinicia el backend para que TypeORM sincronice el esquema y vuelve a cargar el seed para actualizar las CM con sus coordenadas.

Sin una key válida, el seguimiento y sus filtros siguen disponibles, pero el mapa muestra un mensaje indicando que falta configuración o que no se pudo cargar.

## Validación realizada

- `npm run build` en `frontend`: correcto.
- `npm run build` en `backend`: correcto.
- `npm test -- --runInBand` en `backend`: 2 tests aprobados.
- `git diff --check`: sin errores de whitespace.
