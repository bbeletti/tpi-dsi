import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Ingrediente, UnidadMedida } from '../models';

@Component({
  selector: 'app-ingredientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredientes.html',
})
export class Ingredientes implements OnInit {
  private api = inject(ApiService);

  protected readonly ingredientes = signal<Ingrediente[]>([]);
  protected readonly unidadesMedida = signal<UnidadMedida[]>([]);

  // Form State
  protected showForm = signal<boolean>(false);
  protected isEditing = signal<boolean>(false);
  protected formTitle = signal<string>('Nuevo Ingrediente');

  // Input bindings
  protected editId = signal<number | null>(null);
  protected nombre = signal<string>('');
  protected costo = signal<number>(0);
  protected unidadMedidaId = signal<number>(0);

  ngOnInit() {
    this.loadIngredientes();
    this.loadUnidadesMedida();
  }

  loadIngredientes() {
    this.api.getIngredientes().subscribe({
      next: (data) => this.ingredientes.set(data),
      error: (err) => console.error('Error al cargar ingredientes:', err)
    });
  }

  loadUnidadesMedida() {
    this.api.getUnidadesMedida().subscribe({
      next: (data) => {
        this.unidadesMedida.set(data);
        if (data.length > 0) {
          this.unidadMedidaId.set(data[0].id);
        }
      },
      error: (err) => console.error('Error al cargar unidades de medida:', err)
    });
  }

  openNewForm() {
    this.isEditing.set(false);
    this.formTitle.set('Nuevo Ingrediente');
    this.editId.set(null);
    this.nombre.set('');
    this.costo.set(0);
    if (this.unidadesMedida().length > 0) {
      this.unidadMedidaId.set(this.unidadesMedida()[0].id);
    }
    this.showForm.set(true);
  }

  openEditForm(ingrediente: Ingrediente) {
    this.isEditing.set(true);
    this.formTitle.set('Editar Ingrediente');
    this.editId.set(ingrediente.id);
    this.nombre.set(ingrediente.nombre);
    this.costo.set(ingrediente.costo);
    if (ingrediente.unidad_medida) {
      this.unidadMedidaId.set(ingrediente.unidad_medida.id);
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveIngrediente() {
    if (!this.nombre().trim()) {
      alert('El nombre es requerido.');
      return;
    }

    const payload: Partial<Ingrediente> = {
      nombre: this.nombre().toUpperCase(),
      costo: this.costo(),
      unidad_medida_id: this.unidadMedidaId()
    } as any;

    if (this.isEditing() && this.editId()) {
      this.api.updateIngrediente(this.editId()!, payload).subscribe({
        next: () => {
          this.loadIngredientes();
          this.closeForm();
        },
        error: (err) => console.error('Error al guardar ingrediente:', err)
      });
    } else {
      this.api.createIngrediente(payload).subscribe({
        next: () => {
          this.loadIngredientes();
          this.closeForm();
        },
        error: (err) => console.error('Error al crear ingrediente:', err)
      });
    }
  }

  deleteIngrediente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este ingrediente?')) {
      this.api.deleteIngrediente(id).subscribe({
        next: () => {
          this.loadIngredientes();
        },
        error: (err) => {
          console.error('Error al eliminar ingrediente:', err);
          alert('No se pudo eliminar el ingrediente. Posiblemente esté siendo usado en alguna receta.');
        }
      });
    }
  }
}
