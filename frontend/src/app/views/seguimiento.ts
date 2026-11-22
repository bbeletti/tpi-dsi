import { Component, OnInit, OnDestroy, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { ApiService } from '../services/api.service';
import { BolsinSeguimiento, SeguimientoResponse } from '../models';

interface CmMarker {
  id: number;
  nombre: string;
  codigo: string;
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapMarker],
  templateUrl: './seguimiento.html',
})
export class Seguimiento implements OnInit, OnDestroy {
  private api = inject(ApiService);

  protected readonly cmUsuario = signal<{ id: number; nombre: string; codigo: string; latitud?: number | null; longitud?: number | null } | null>(null);
  protected readonly bolsines = signal<BolsinSeguimiento[]>([]);

  // Filter states
  protected readonly filtroPrecinto = signal<string>('');
  protected readonly filtroDestino = signal<string>('');

  // Selected Bolsin & Toast
  protected readonly selectedBolsin = signal<BolsinSeguimiento | null>(null);
  protected readonly showToast = signal<boolean>(false);
  protected readonly toastMessage = signal<string>('');

  // Google Maps state
  protected readonly mapsApiKey = signal<string>('');
  protected readonly mapsLoaded = signal<boolean>(false);
  protected readonly mapCenter = signal<google.maps.LatLngLiteral>({ lat: -34.6037, lng: -58.3816 });
  protected readonly mapZoom = signal<number>(12);
  protected readonly cmMarkers = signal<CmMarker[]>([]);
  protected readonly selectedCm = signal<CmMarker | null>(null);
  protected readonly cmInfoPosition = signal<google.maps.LatLngLiteral | null>(null);

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  private refreshInterval: any = null;

  ngOnInit() {
    this.api.getMapsConfig().subscribe({
      next: (res) => {
        this.mapsApiKey.set(res.apiKey || '');
        if (res.apiKey) {
          this.loadGoogleMapsScript(res.apiKey);
        }
      },
      error: (err) => console.error('Error al obtener config de maps:', err)
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

  private loadGoogleMapsScript(apiKey: string) {
    if ((window as any).google && (window as any).google.maps) {
      this.mapsLoaded.set(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.mapsLoaded.set(true);
    script.onerror = () => console.error('No se pudo cargar Google Maps');
    document.head.appendChild(script);
  }

  loadData() {
    this.api.consultarSeguimiento().subscribe({
      next: (res: SeguimientoResponse) => {
        this.cmUsuario.set(res.cmUsuario);
        this.bolsines.set(res.bolsines);

        // Update map center based on user's CM
        if (res.cmUsuario && res.cmUsuario.latitud != null && res.cmUsuario.longitud != null) {
          this.mapCenter.set({ lat: res.cmUsuario.latitud, lng: res.cmUsuario.longitud });
        }

        // Build unique CM markers from user CM + origins/destinations
        const cmMap = new Map<string, CmMarker>();
        if (res.cmUsuario && res.cmUsuario.latitud != null && res.cmUsuario.longitud != null) {
          cmMap.set(res.cmUsuario.codigo, {
            id: res.cmUsuario.id,
            nombre: res.cmUsuario.nombre,
            codigo: res.cmUsuario.codigo,
            latitud: res.cmUsuario.latitud,
            longitud: res.cmUsuario.longitud
          });
        }
        for (const b of res.bolsines) {
          if (b.origen.latitud != null && b.origen.longitud != null) {
            cmMap.set(b.origen.codigo, {
              id: b.origen.id,
              nombre: b.origen.nombre,
              codigo: b.origen.codigo,
              latitud: b.origen.latitud,
              longitud: b.origen.longitud
            });
          }
          if (b.destino.latitud != null && b.destino.longitud != null) {
            cmMap.set(b.destino.codigo, {
              id: b.destino.id,
              nombre: b.destino.nombre,
              codigo: b.destino.codigo,
              latitud: b.destino.latitud,
              longitud: b.destino.longitud
            });
          }
        }
        this.cmMarkers.set(Array.from(cmMap.values()));

        // Preserve selection or update it with fresh coordinates
        if (this.selectedBolsin()) {
          const updated = res.bolsines.find(b => b.id === this.selectedBolsin()!.id);
          this.selectedBolsin.set(updated || null);
        }
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

  selectBolsin(bolsin: BolsinSeguimiento) {
    this.selectedBolsin.set(bolsin);
  }

  clearSelection() {
    this.selectedBolsin.set(null);
  }

  selectCm(cm: CmMarker) {
    this.selectedCm.set(cm);
    this.cmInfoPosition.set({ lat: cm.latitud, lng: cm.longitud });
    // Ensure the info window opens after position is applied
    setTimeout(() => this.infoWindow?.open(), 0);
  }

  clearCmSelection() {
    this.selectedCm.set(null);
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

  markerOptions(bolsin: BolsinSeguimiento) {
    const isSelected = this.selectedBolsin()?.id === bolsin.id;
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: isSelected ? '#ef4444' : '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    };
  }

  cmMarkerOptions() {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3182ce',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    };
  }
}
