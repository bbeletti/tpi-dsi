import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface MapsConfig {
  googleMapsApiKey: string;
  googleMapsMapId: string;
}

/**
 * Carga el script de Google Maps JavaScript API una sola vez.
 * La API key la entrega el backend (GET /api/config) a partir de la variable
 * de entorno GOOGLE_MAPS_API_KEY, así no queda escrita en el código.
 */
@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private http = inject(HttpClient);
  private readonly configUrl = 'http://localhost:8000/api/config';
  private loading: Promise<MapsConfig> | null = null;

  /** true cuando no hay API key configurada (Google Maps corre en modo desarrollo). */
  readonly sinApiKey = signal(false);

  load(): Promise<MapsConfig> {
    this.loading ??= this.cargar();
    return this.loading;
  }

  private async cargar(): Promise<MapsConfig> {
    const config = await firstValueFrom(this.http.get<MapsConfig>(this.configUrl));
    this.sinApiKey.set(!config.googleMapsApiKey);

    if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
      return config;
    }

    await new Promise<void>((resolve, reject) => {
      const callbackName = '__onGoogleMapsLoaded';
      (window as any)[callbackName] = () => resolve();

      const params = new URLSearchParams({ loading: 'async', callback: callbackName, language: 'es', region: 'AR' });
      if (config.googleMapsApiKey) {
        params.set('key', config.googleMapsApiKey);
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps JavaScript API'));
      document.head.appendChild(script);
    });

    return config;
  }
}
