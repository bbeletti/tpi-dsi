import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Venta, Cliente, Producto } from '../models';

interface SaleItemBuilder {
  producto_id: number;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
})
export class Ventas implements OnInit {
  private api = inject(ApiService);

  protected readonly ventas = signal<Venta[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);

  // Form State
  protected showForm = signal<boolean>(false);
  protected formTitle = signal<string>('Registrar Venta');

  // Input bindings
  protected fecha = signal<string>('');
  protected clienteId = signal<number>(0);
  protected saleItems = signal<SaleItemBuilder[]>([]);

  // Computed total for the new sale
  protected readonly totalVenta = computed(() => {
    let total = 0;
    const items = this.saleItems();
    const prods = this.productos();

    for (const item of items) {
      const prod = prods.find(p => p.id === +item.producto_id);
      if (prod) {
        total += item.cantidad * prod.precio;
      }
    }
    return Math.round(total * 100) / 100;
  });

  ngOnInit() {
    this.loadVentas();
    this.loadClientes();
    this.loadProductos();
    this.setDefaultDate();
  }

  setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.fecha.set(`${yyyy}-${mm}-${dd}`);
  }

  loadVentas() {
    this.api.getVentas().subscribe({
      next: (data) => this.ventas.set(data),
      error: (err) => console.error('Error al cargar ventas:', err)
    });
  }

  loadClientes() {
    this.api.getClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        if (data.length > 0) {
          this.clienteId.set(data[0].id);
        }
      },
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  loadProductos() {
    this.api.getProductos().subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  openNewForm() {
    this.setDefaultDate();
    if (this.clientes().length > 0) {
      this.clienteId.set(this.clientes()[0].id);
    }
    this.saleItems.set([]);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  addSaleItem() {
    if (this.productos().length === 0) {
      alert('Primero debes registrar productos en el sistema.');
      return;
    }
    
    const newItem: SaleItemBuilder = {
      producto_id: this.productos()[0].id,
      cantidad: 1 // default quantity
    };
    
    this.saleItems.update(items => [...items, newItem]);
  }

  removeSaleItem(index: number) {
    this.saleItems.update(items => items.filter((_, i) => i !== index));
  }

  updateItemProduct(index: number, val: string) {
    this.saleItems.update(items => {
      const updated = [...items];
      updated[index].producto_id = +val;
      return updated;
    });
  }

  updateItemCantidad(index: number, val: string) {
    this.saleItems.update(items => {
      const updated = [...items];
      updated[index].cantidad = parseFloat(val) || 0;
      return updated;
    });
  }

  saveVenta() {
    if (!this.fecha()) {
      alert('La fecha es requerida.');
      return;
    }

    if (this.saleItems().length === 0) {
      alert('La venta debe tener al menos un producto en el detalle.');
      return;
    }

    const payload = {
      fecha: this.fecha(),
      cliente_id: +this.clienteId(),
      detalle: this.saleItems().map(item => ({
        producto_id: +item.producto_id,
        cantidad: item.cantidad
      }))
    };

    this.api.createVenta(payload).subscribe({
      next: () => {
        this.loadVentas();
        this.closeForm();
      },
      error: (err) => console.error('Error al registrar venta:', err)
    });
  }

  deleteVenta(id: number) {
    if (confirm('¿Estás seguro de que deseas anular esta venta?')) {
      this.api.deleteVenta(id).subscribe({
        next: () => {
          this.loadVentas();
        },
        error: (err) => console.error('Error al eliminar venta:', err)
      });
    }
  }

  getProductPrice(productoId: number): number {
    const prod = this.productos().find(p => p.id === +productoId);
    return prod?.precio || 0;
  }
}
