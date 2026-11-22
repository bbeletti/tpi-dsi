import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private readonly themeService = inject(ThemeService);
  protected readonly isLightTheme = this.themeService.isLightTheme;

  // Barra lateral contraída (solo íconos). Se recuerda entre visitas.
  private readonly SIDEBAR_KEY = 'sidebar-collapsed';
  protected readonly sidebarCollapsed = signal(this.leerPreferencia());

  constructor() {
    effect(() => {
      const collapsed = this.sidebarCollapsed();
      try {
        localStorage.setItem(this.SIDEBAR_KEY, String(collapsed));
      } catch {
        // Sin acceso a localStorage (modo privado, etc.): no se recuerda
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  private leerPreferencia(): boolean {
    try {
      return localStorage.getItem(this.SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  }
}


