import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Venta } from '../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  
  protected readonly totalVentas = signal<number>(0);
  protected readonly cantidadVentas = signal<number>(0);
  protected readonly cantidadProductos = signal<number>(0);
  protected readonly cantidadClientes = signal<number>(0);
  protected readonly ventasRecientes = signal<Venta[]>([]);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getVentas().subscribe({
      next: (ventas) => {
        this.cantidadVentas.set(ventas.length);
        this.totalVentas.set(ventas.reduce((sum, v) => sum + v.total, 0));
        this.ventasRecientes.set(ventas.slice(0, 5));
      },
      error: (err) => console.error('Error al cargar ventas:', err)
    });

    this.api.getProductos().subscribe({
      next: (productos) => this.cantidadProductos.set(productos.length),
      error: (err) => console.error('Error al cargar productos:', err)
    });

    this.api.getClientes().subscribe({
      next: (clientes) => this.cantidadClientes.set(clientes.length),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }
}
