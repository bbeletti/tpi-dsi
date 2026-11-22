import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { ApiService } from '../services/api.service';
import { GoogleMapsLoaderService } from '../services/google-maps-loader.service';
import { ThemeService } from '../services/theme.service';
import { BolsinSeguimiento, CM } from '../models';

/** Recorrido de un bolsín partido en su posición actual. */
interface Tramos {
  recorrido: google.maps.LatLngLiteral[];
  restante: google.maps.LatLngLiteral[];
}

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapAdvancedMarker, MapPolyline],
  templateUrl: './seguimiento.html',
})
export class Seguimiento implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private mapsLoader = inject(GoogleMapsLoaderService);
  private theme = inject(ThemeService);

  protected readonly cmUsuario = signal<{ id: number; nombre: string; codigo: string } | null>(null);
  protected readonly bolsines = signal<BolsinSeguimiento[]>([]);
  protected readonly cms = signal<CM[]>([]);

  // Filter states
  protected readonly filtroPrecinto = signal<string>('');
  protected readonly filtroDestino = signal<string>('');

  // Selected Bolsin & Toast
  protected readonly selectedBolsin = signal<BolsinSeguimiento | null>(null);
  protected readonly showToast = signal<boolean>(false);
  protected readonly toastMessage = signal<string>('');

  // Google Maps
  // Instancia actual del mapa (cambia cuando se recrea al cambiar el tema)
  private googleMap?: google.maps.Map;
  protected readonly mapsReady = signal(false);
  protected readonly mapsError = signal<string | null>(null);
  protected readonly sinApiKey = this.mapsLoader.sinApiKey;
  private readonly mapId = signal('DEMO_MAP_ID');
  // Vista inicial: Argentina completa (después se encuadra según las CM y los bolsines)
  protected readonly center: google.maps.LatLngLiteral = { lat: -35, lng: -63.5 };
  protected readonly zoom = 4;
  private boundsFitted = false;
  // Con el zoom alejado (vista de todo el país) se ocultan las etiquetas de los bolsines para que no se pisen
  private readonly zoomActual = signal(4);
  protected readonly etiquetasOcultas = computed(() => this.zoomActual() < 7);

  // El esquema de color de Google Maps solo se puede fijar al crear el mapa:
  // el template recrea el mapa cuando cambia el tema.
  protected readonly colorScheme = computed(() => (this.theme.isLightTheme() ? 'LIGHT' : 'DARK'));
  protected readonly mapOptions = computed<google.maps.MapOptions>(() => ({
    mapId: this.mapId(),
    colorScheme: this.colorScheme(),
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  }));

  // Rutas reales (Google Routes API), cacheadas por bolsín y posición:
  // solo se vuelven a pedir si el bolsín cambia de lugar.
  private readonly rutas = signal<Record<string, Tramos>>({});
  private readonly rutasPedidas = new Set<string>();

  /**
   * Tramos a dibujar por bolsín, en orden de preferencia: la ruta precalculada que
   * entrega el backend, la de Google Routes (si hay API key) o una línea recta.
   */
  protected readonly tramos = computed(() => {
    const rutas = this.rutas();
    const res: Record<number, Tramos> = {};
    for (const b of this.bolsines()) {
      const tramos = this.tramosPrecalculados(b) ?? rutas[this.claveRuta(b)] ?? this.tramosEnLineaRecta(b);
      if (tramos) res[b.id] = tramos;
    }
    return res;
  });

  // Elementos HTML de los markers, cacheados para que Angular no los recree en cada detección de cambios
  private markerContentCache = new Map<string, HTMLElement>();
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.mapsLoader
      .load()
      .then((config) => {
        this.mapId.set(config.googleMapsMapId);
        this.mapsReady.set(true);
        this.calcularRutas();
      })
      .catch((err) => {
        console.error(err);
        this.mapsError.set('No se pudo cargar Google Maps. Revisá la conexión y la configuración de la API key.');
      });

    this.api.getCMs().subscribe({
      next: (cms) => {
        this.cms.set(cms);
        this.fitBoundsOnce();
      },
      error: (err) => console.error('Error al consultar comisiones médicas:', err),
    });

    this.loadData();
    // Auto-refresh from backend every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.loadData();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData() {
    this.api.consultarSeguimiento().subscribe({
      next: (res) => {
        this.cmUsuario.set(res.cmUsuario);
        this.bolsines.set(res.bolsines);

        // Preserve selection or update it with fresh coordinates
        if (this.selectedBolsin()) {
          const updated = res.bolsines.find(b => b.id === this.selectedBolsin()!.id);
          this.selectedBolsin.set(updated || null);
        }
        this.fitBoundsOnce();
        this.calcularRutas();
      },
      error: (err) => console.error('Error al consultar seguimiento:', err)
    });
  }

  // Filtered list
  get bolsinesFiltrados(): BolsinSeguimiento[] {
    const precinto = this.filtroPrecinto().toLowerCase().trim();
    const destino = this.filtroDestino().toLowerCase().trim();

    return this.bolsines().filter(b => {
      const matchPrecinto = !precinto || b.numeroPrecinto.toLowerCase().includes(precinto);
      const matchDestino = !destino || b.destino.nombre.toLowerCase().includes(destino) || b.destino.codigo.toLowerCase().includes(destino);
      return matchPrecinto && matchDestino;
    });
  }

  // CU 36 - Paso 7: el EB selecciona un bolsín del mapa (o del listado)
  selectBolsin(bolsin: BolsinSeguimiento) {
    this.selectedBolsin.set(bolsin);
    this.googleMap?.panTo({ lat: bolsin.latitud, lng: bolsin.longitud });
  }

  clearSelection() {
    this.selectedBolsin.set(null);
  }

  notificarGCM(bolsin: BolsinSeguimiento) {
    const payload = {
      numeroBolsin: bolsin.numeroBolsin,
      latitud: bolsin.latitud,
      longitud: bolsin.longitud,
      fechaHoraActualizacion: bolsin.fechaHoraActualizacion,
      emailDestino: bolsin.emailDestino
    };

    this.api.notificarUbicacion(payload).subscribe({
      next: (res) => {
        this.toastMessage.set(res.message);
        this.showToast.set(true);
        setTimeout(() => {
          this.showToast.set(false);
        }, 5000);
      },
      error: (err) => {
        console.error('Error al enviar notificación:', err);
        alert('No se pudo enviar la notificación por correo electrónico.');
      }
    });
  }

  // ---- Google Maps ----

  onMapInitialized(map: google.maps.Map) {
    // Cada vez que se recrea el mapa (por ejemplo, al cambiar el tema) se vuelve a encuadrar
    this.googleMap = map;
    this.boundsFitted = false;
    this.fitBoundsOnce();
  }

  onZoomChanged() {
    this.zoomActual.set(this.googleMap?.getZoom() ?? 4);
  }

  /** Encuadra el mapa para que se vean todas las CM y los bolsines, una sola vez por mapa. */
  private fitBoundsOnce() {
    const map = this.googleMap;
    if (this.boundsFitted || !map) return;

    const puntos: google.maps.LatLngLiteral[] = [
      ...this.cmsConUbicacion().map((cm) => ({ lat: cm.latitud!, lng: cm.longitud! })),
      ...this.bolsines().map((b) => ({ lat: b.latitud, lng: b.longitud })),
    ];
    if (puntos.length < 2) return;

    const bounds = new google.maps.LatLngBounds();
    puntos.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 48);
    this.boundsFitted = true;
  }

  // ---- Rutas ----

  private claveRuta(b: BolsinSeguimiento): string {
    return `${b.id}:${b.latitud},${b.longitud}`;
  }

  private tramosPrecalculados(b: BolsinSeguimiento): Tramos | null {
    if (!b.ruta?.length) return null;
    const puntos = b.ruta.map(([lat, lng]) => ({ lat, lng }));
    return this.partirEnPosicion(puntos, { lat: b.latitud, lng: b.longitud });
  }

  /** Corta un recorrido en el punto más cercano a la posición del bolsín. */
  private partirEnPosicion(puntos: google.maps.LatLngLiteral[], posicion: google.maps.LatLngLiteral): Tramos {
    let corte = 0;
    let distanciaMinima = Infinity;
    puntos.forEach((p, i) => {
      const d = (p.lat - posicion.lat) ** 2 + (p.lng - posicion.lng) ** 2;
      if (d < distanciaMinima) {
        distanciaMinima = d;
        corte = i;
      }
    });
    return {
      recorrido: [...puntos.slice(0, corte + 1), posicion],
      restante: [posicion, ...puntos.slice(corte + 1)],
    };
  }

  private tramosEnLineaRecta(b: BolsinSeguimiento): Tramos | null {
    if (b.origen.latitud == null || b.origen.longitud == null || b.destino.latitud == null || b.destino.longitud == null) {
      return null;
    }
    const posicion = { lat: b.latitud, lng: b.longitud };
    return {
      recorrido: [{ lat: b.origen.latitud, lng: b.origen.longitud }, posicion],
      restante: [posicion, { lat: b.destino.latitud, lng: b.destino.longitud }],
    };
  }

  /** Pide a Google Routes la ruta de los bolsines sin ruta precalculada. Sin API key no se pide nada. */
  private calcularRutas() {
    if (!this.mapsReady() || this.sinApiKey()) return;

    for (const b of this.bolsines()) {
      const clave = this.claveRuta(b);
      if (b.ruta?.length || this.rutasPedidas.has(clave) || !this.tramosEnLineaRecta(b)) continue;
      this.rutasPedidas.add(clave);
      this.calcularRuta(b, clave);
    }
  }

  private async calcularRuta(b: BolsinSeguimiento, clave: string) {
    const posicion = { lat: b.latitud, lng: b.longitud };
    try {
      const { Route } = (await google.maps.importLibrary('routes')) as google.maps.RoutesLibrary;
      // Una sola consulta por bolsín: origen → posición actual (punto de paso) → destino
      const { routes } = await Route.computeRoutes({
        origin: { lat: b.origen.latitud!, lng: b.origen.longitud! },
        destination: { lat: b.destino.latitud!, lng: b.destino.longitud! },
        intermediates: [{ location: posicion, via: true }],
        travelMode: 'DRIVING',
        polylineQuality: 'OVERVIEW',
        language: 'es',
        region: 'AR',
        fields: ['path'],
      });

      const path = routes?.[0]?.path;
      if (!path?.length) throw new Error('Respuesta sin recorrido');
      // La ruta pasa por la posición del bolsín: se corta ahí
      const tramos = this.partirEnPosicion(path.map((p) => ({ lat: p.lat, lng: p.lng })), posicion);
      this.rutas.update((rutas) => ({ ...rutas, [clave]: tramos }));
    } catch (err) {
      // Se mantiene la línea recta como respaldo
      console.warn(`No se pudo calcular la ruta del bolsín ${b.numeroBolsin}; se dibuja en línea recta.`, err);
    }
  }

  cmsConUbicacion(): CM[] {
    return this.cms().filter((cm) => cm.latitud != null && cm.longitud != null);
  }

  cmContent(cm: CM): HTMLElement {
    return this.cachedElement(`cm-${cm.id}`, () => {
      const el = document.createElement('div');
      el.className = 'gm-cm';
      el.innerHTML = '<span class="gm-cm-dot"></span><span class="gm-label"></span>';
      el.querySelector('.gm-label')!.textContent = cm.nombre;
      return el;
    });
  }

  bolsinContent(bolsin: BolsinSeguimiento, selected: boolean): HTMLElement {
    // Bolsines en la misma posición: se apilan las etiquetas para que no se pisen
    const stack = this.bolsinesFiltrados
      .filter((b) => b.latitud === bolsin.latitud && b.longitud === bolsin.longitud)
      .findIndex((b) => b.id === bolsin.id);

    return this.cachedElement(`bolsin-${bolsin.id}-${selected}-${stack}`, () => {
      const el = document.createElement('div');
      el.className = selected ? 'gm-bolsin selected' : 'gm-bolsin';
      el.innerHTML = '<span class="gm-bolsin-dot"></span><span class="gm-label"></span>';
      const label = el.querySelector<HTMLElement>('.gm-label')!;
      label.textContent = `${bolsin.numeroPrecinto} → ${bolsin.destino.codigo}`;
      label.style.marginTop = `${stack * 18}px`;
      return el;
    });
  }

  private cachedElement(key: string, crear: () => HTMLElement): HTMLElement {
    let el = this.markerContentCache.get(key);
    if (!el) {
      el = crear();
      this.markerContentCache.set(key, el);
    }
    return el;
  }
}
