import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';
  readonly isLightTheme = signal<boolean>(false);

  constructor() {
    // Load preference from localStorage
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersLight = savedTheme === 'light';
    this.isLightTheme.set(prefersLight);

    // Apply class to body
    effect(() => {
      const light = this.isLightTheme();
      if (light) {
        document.body.classList.add('light-theme');
        localStorage.setItem(this.STORAGE_KEY, 'light');
      } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem(this.STORAGE_KEY, 'dark');
      }
    });
  }

  toggleTheme() {
    this.isLightTheme.update(val => !val);
  }
}
