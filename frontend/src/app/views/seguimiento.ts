import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { BolsinSeguimiento } from '../models';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seguimiento.html',
})
export class Seguimiento implements OnInit, OnDestroy, AfterViewInit {
  private api = inject(ApiService);

  protected readonly cmUsuario = signal<{ id: number; nombre: string; codigo: string } | null>(null);
  protected readonly bolsines = signal<BolsinSeguimiento[]>([]);
  
  // Filter states
  protected readonly filtroPrecinto = signal<string>('');
  protected readonly filtroDestino = signal<string>('');

  // Selected Bolsin & Toast
  protected readonly selectedBolsin = signal<BolsinSeguimiento | null>(null);
  protected readonly showToast = signal<boolean>(false);
  protected readonly toastMessage = signal<string>('');

  // Canvas element ref for drawing the map
  @ViewChild('mapCanvas', { static: false }) mapCanvas!: ElementRef<HTMLCanvasElement>;
  private animationId: number | null = null;
  private refreshInterval: any = null;
  private pulseSize = 0;
  private pulseDir = 1;

  // Commissions geographic locations for map rendering
  private readonly commissions = [
    { name: 'CM Central', code: 'CM-01', lat: -34.6037, lng: -58.3816, x: 0, y: 0 },
    { name: 'CM Norte', code: 'CM-02', lat: -34.5600, lng: -58.4500, x: 0, y: 0 },
    { name: 'CM Sur', code: 'CM-03', lat: -34.6600, lng: -58.3300, x: 0, y: 0 },
  ];

  ngOnInit() {
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
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  ngAfterViewInit() {
    this.startMapAnimation();
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

  // Map drawing and animation loop
  private startMapAnimation() {
    const canvas = this.mapCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to its display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 400 * window.devicePixelRatio; // Fixed display height
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = 400; // Display height

      ctx.clearRect(0, 0, w, h);

      const isLight = document.body.classList.contains('light-theme');

      // 1. Draw Radar Grid
      ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.2)' : 'rgba(74, 85, 104, 0.15)';
      ctx.lineWidth = 1;
      // Vertical lines
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Map Coordinate helper
      const mapCoords = (lat: number, lng: number) => {
        const minLat = -34.68;
        const maxLat = -34.54;
        const minLng = -58.47;
        const maxLng = -58.31;
        
        const pctY = (lat - maxLat) / (minLat - maxLat);
        const pctX = (lng - minLng) / (maxLng - minLng);
        
        return {
          x: 60 + pctX * (w - 120),
          y: 50 + pctY * (h - 100)
        };
      };

      // 2. Draw paths between commissions
      ctx.strokeStyle = isLight ? 'rgba(49, 130, 206, 0.35)' : 'rgba(66, 153, 225, 0.25)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      const c1 = mapCoords(this.commissions[0].lat, this.commissions[0].lng);
      const c2 = mapCoords(this.commissions[1].lat, this.commissions[1].lng);
      const c3 = mapCoords(this.commissions[2].lat, this.commissions[2].lng);

      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.stroke();

      ctx.setLineDash([]); // Reset

      // 3. Draw commission nodes
      this.commissions.forEach((cm) => {
        const pos = mapCoords(cm.lat, cm.lng);
        cm.x = pos.x;
        cm.y = pos.y;

        // Outer glow
        ctx.fillStyle = isLight ? 'rgba(49, 130, 206, 0.1)' : 'rgba(66, 153, 225, 0.15)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = '#3182ce';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = isLight ? '#f1f5f9' : '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = isLight ? '#475569' : '#cbd5e1';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cm.name, pos.x, pos.y - 12);
      });

      // Update pulse animation size
      this.pulseSize += 0.25 * this.pulseDir;
      if (this.pulseSize > 12 || this.pulseSize < 0) {
        this.pulseDir *= -1;
      }

      // 4. Draw bolsines in transit (based on filtered list)
      this.bolsinesFiltrados.forEach((bolsin: BolsinSeguimiento) => {
        const pos = mapCoords(bolsin.latitud, bolsin.longitud);

        const isSelected = this.selectedBolsin()?.id === bolsin.id;

        // Draw animated pulse ring
        ctx.strokeStyle = isSelected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8 + this.pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid core
        ctx.fillStyle = isSelected ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isLight ? '#f1f5f9' : '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Label with precinto and destination
        ctx.font = isSelected ? 'bold 10px sans-serif' : '9px sans-serif';
        ctx.textAlign = 'left';
        
        const labelText = `${bolsin.numeroPrecinto} → ${bolsin.destino.codigo}`;
        ctx.fillStyle = isSelected ? (isLight ? '#dc2626' : '#f87171') : (isLight ? '#047857' : '#a7f3d0');
        ctx.fillText(labelText, pos.x + 8, pos.y + 3);
      });

      this.animationId = requestAnimationFrame(render);
    };

    // Canvas click handler to select a bolsin
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const mapCoords = (lat: number, lng: number) => {
        const minLat = -34.68;
        const maxLat = -34.54;
        const minLng = -58.47;
        const maxLng = -58.31;
        const w = rect.width;
        const h = 400;
        
        const pctY = (lat - maxLat) / (minLat - maxLat);
        const pctX = (lng - minLng) / (maxLng - minLng);
        
        return {
          x: 60 + pctX * (w - 120),
          y: 50 + pctY * (h - 100)
        };
      };

      // Check if clicked near any bolsin
      let found = false;
      this.bolsinesFiltrados.forEach((bolsin: BolsinSeguimiento) => {
        const pos = mapCoords(bolsin.latitud, bolsin.longitud);
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= 15) {
          this.selectBolsin(bolsin);
          found = true;
        }
      });

      if (!found) {
        // Clear selection if clicked elsewhere on canvas
        this.clearSelection();
      }
    });

    render();
  }
}
