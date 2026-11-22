import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { ApiService } from '../services/api.service';
import { GoogleMapsLoaderService } from '../services/google-maps-loader.service';
import { ThemeService } from '../services/theme.service';
import { BolsinSeguimiento, CM } from '../models';

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

  // Elementos HTML de los markers, cacheados para que Angular no los recree en cada detección de cambios
  private markerContentCache = new Map<string, HTMLElement>();
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.mapsLoader
      .load()
      .then((config) => {
        this.mapId.set(config.googleMapsMapId);
        this.mapsReady.set(true);
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
