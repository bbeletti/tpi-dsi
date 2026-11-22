import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { ApiService } from '../services/api.service';
import { GoogleMapsLoaderService } from '../services/google-maps-loader.service';
import { BolsinSeguimiento, CM } from '../models';

interface CommissionWithCoordinates extends CM {
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './seguimiento.html',
})
export class Seguimiento implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  protected readonly cmUsuario = signal<{ id: number; nombre: string; codigo: string } | null>(null);
  protected readonly bolsines = signal<BolsinSeguimiento[]>([]);
  protected readonly commissions = signal<CM[]>([]);
  protected readonly mapsLoaded = signal(false);
  protected readonly mapError = signal<string | null>(null);
  protected readonly cmMarkerIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  protected readonly bolsinMarkerIcon = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
  protected readonly selectedMarkerIcon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  protected readonly mapOptions = {
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  // Filter states
  protected readonly filtroPrecinto = signal<string>('');
  protected readonly filtroDestino = signal<string>('');

  // Selected Bolsin & Toast
  protected readonly selectedBolsin = signal<BolsinSeguimiento | null>(null);
  protected readonly showToast = signal<boolean>(false);
  protected readonly toastMessage = signal<string>('');

  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.loadData();
    this.loadMapConfiguration();
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

  get mapCenter(): { lat: number; lng: number } {
    const userCommission = this.commissionsWithCoordinates.find(cm => cm.id === this.cmUsuario()?.id);
    const commission = userCommission ?? this.commissionsWithCoordinates[0];
    return commission
      ? { lat: commission.latitud, lng: commission.longitud }
      : { lat: -34.6037, lng: -58.3816 };
  }

  get commissionsWithCoordinates(): CommissionWithCoordinates[] {
    return this.commissions().filter(
      (cm): cm is CommissionWithCoordinates => cm.latitud !== null && cm.longitud !== null,
    );
  }

  private loadMapConfiguration() {
    this.api.getCMs().subscribe({
      next: (cms) => this.commissions.set(cms),
      error: (err) => {
        console.error('Error al consultar las Comisiones Médicas:', err);
        this.mapError.set('No se pudieron cargar las coordenadas de las Comisiones Médicas.');
      },
    });

    this.api.getGoogleMapsConfig().subscribe({
      next: ({ apiKey }) => {
        if (!apiKey.trim()) {
          this.mapError.set('Configura GOOGLE_MAPS_API_KEY en el entorno del backend para mostrar el mapa.');
          return;
        }

        this.googleMapsLoader.load(apiKey).then(
          () => this.mapsLoaded.set(true),
          (err: unknown) => {
            console.error('Error al cargar Google Maps:', err);
            this.mapError.set('No se pudo cargar Google Maps. Verifica la API key y sus restricciones.');
          },
        );
      },
      error: (err) => {
        console.error('Error al consultar la configuración de Google Maps:', err);
        this.mapError.set('No se pudo consultar la configuración de Google Maps.');
      },
    });
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

  bolsinPosition(bolsin: BolsinSeguimiento) {
    return { lat: bolsin.latitud, lng: bolsin.longitud };
  }

  commissionPosition(commission: CommissionWithCoordinates) {
    return { lat: commission.latitud, lng: commission.longitud };
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
}
