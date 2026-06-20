import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Cliente, Barrio, Localidad, Provincia } from '../models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  private api = inject(ApiService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly barrios = signal<Barrio[]>([]);
  protected readonly localidades = signal<Localidad[]>([]);
  protected readonly provincias = signal<Provincia[]>([]);

  // Form State
  protected showForm = signal<boolean>(false);
  protected isEditing = signal<boolean>(false);
  protected formTitle = signal<string>('Nuevo Cliente');

  // Input bindings
  protected editId = signal<number | null>(null);
  protected nombre = signal<string>('');
  protected numeroDocumento = signal<number | null>(null);
  protected direccion = signal<string>('');
  protected celular = signal<number | null>(null);
  protected telefono = signal<number | null>(null);
  protected email = signal<string>('');
  protected barrioId = signal<number | null>(null);
  protected localidadId = signal<number | null>(null);
  protected provinciaId = signal<number | null>(null);

  ngOnInit() {
    this.loadClientes();
    this.loadAuxiliarData();
  }

  loadClientes() {
    this.api.getClientes().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  loadAuxiliarData() {
    this.api.getBarrios().subscribe({
      next: (data) => this.barrios.set(data),
      error: (err) => console.error('Error al cargar barrios:', err)
    });
    this.api.getLocalidades().subscribe({
      next: (data) => this.localidades.set(data),
      error: (err) => console.error('Error al cargar localidades:', err)
    });
    this.api.getProvincias().subscribe({
      next: (data) => this.provincias.set(data),
      error: (err) => console.error('Error al cargar provincias:', err)
    });
  }

  openNewForm() {
    this.isEditing.set(false);
    this.formTitle.set('Nuevo Cliente');
    this.editId.set(null);
    this.nombre.set('');
    this.numeroDocumento.set(null);
    this.direccion.set('');
    this.celular.set(null);
    this.telefono.set(null);
    this.email.set('');
    this.barrioId.set(null);
    this.localidadId.set(null);
    this.provinciaId.set(null);
    this.showForm.set(true);
  }

  openEditForm(cliente: Cliente) {
    this.isEditing.set(true);
    this.formTitle.set('Editar Cliente');
    this.editId.set(cliente.id);
    this.nombre.set(cliente.nombre);
    this.numeroDocumento.set(cliente.numero_documento || null);
    this.direccion.set(cliente.direccion || '');
    this.celular.set(cliente.celular || null);
    this.telefono.set(cliente.telefono || null);
    this.email.set(cliente.email || '');
    this.barrioId.set(cliente.barrio?.id || null);
    this.localidadId.set(cliente.localidad?.id || null);
    this.provinciaId.set(cliente.provincia?.id || null);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveCliente() {
    if (!this.nombre().trim()) {
      alert('El nombre es requerido.');
      return;
    }

    const payload = {
      nombre: this.nombre().toUpperCase(),
      numero_documento: this.numeroDocumento(),
      direccion: this.direccion(),
      celular: this.celular(),
      telefono: this.telefono(),
      email: this.email(),
      barrio_id: this.barrioId() ? +this.barrioId()! : null,
      localidad_id: this.localidadId() ? +this.localidadId()! : null,
      provincia_id: this.provinciaId() ? +this.provinciaId()! : null,
    };

    if (this.isEditing() && this.editId()) {
      this.api.updateCliente(this.editId()!, payload as any).subscribe({
        next: () => {
          this.loadClientes();
          this.closeForm();
        },
        error: (err) => console.error('Error al actualizar cliente:', err)
      });
    } else {
      this.api.createCliente(payload as any).subscribe({
        next: () => {
          this.loadClientes();
          this.closeForm();
        },
        error: (err) => console.error('Error al crear cliente:', err)
      });
    }
  }

  deleteCliente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.api.deleteCliente(id).subscribe({
        next: () => {
          this.loadClientes();
        },
        error: (err) => {
          console.error('Error al eliminar cliente:', err);
          alert('No se pudo eliminar el cliente. Posiblemente posea ventas registradas en el sistema.');
        }
      });
    }
  }
}
