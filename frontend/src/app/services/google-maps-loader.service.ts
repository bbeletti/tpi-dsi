import { Injectable } from '@angular/core';

declare global {
  interface Window {
    googleMapsApiLoaded?: () => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsLoaderService {
  private loadPromise: Promise<void> | null = null;

  load(apiKey: string): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=googleMapsApiLoaded`;
        script.async = true;
        script.defer = true;
        window.googleMapsApiLoaded = () => {
          delete window.googleMapsApiLoaded;
          resolve();
        };
        script.onerror = () => {
          delete window.googleMapsApiLoaded;
          this.loadPromise = null;
          reject(new Error('No se pudo cargar Google Maps.'));
        };
        document.head.appendChild(script);
      });
    }

    return this.loadPromise;
  }
}
