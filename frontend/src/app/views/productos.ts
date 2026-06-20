import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Producto, Ingrediente, Receta } from '../models';

interface RecipeBuilderItem {
  ingrediente_id: number;
  cantidad: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
})
export class Productos implements OnInit {
  private api = inject(ApiService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly ingredientes = signal<Ingrediente[]>([]);

  // Form State
  protected showForm = signal<boolean>(false);
  protected isEditing = signal<boolean>(false);
  protected formTitle = signal<string>('Nuevo Producto');

  // Input bindings
  protected editId = signal<number | null>(null);
  protected nombre = signal<string>('');
  protected ganancia = signal<number>(1.5); // Default profit margin (50% profit)
  protected esRelleno = signal<boolean>(false);
  
  // Recipe Builder items
  protected recetaItems = signal<RecipeBuilderItem[]>([]);

  // Computed live calculations for the recipe builder
  protected readonly costoTotalReceta = computed(() => {
    let total = 0;
    const items = this.recetaItems();
    const ings = this.ingredientes();
    
    for (const item of items) {
      const ing = ings.find(i => i.id === +item.ingrediente_id);
      if (ing) {
        total += item.cantidad * ing.costo;
      }
    }
    return Math.round(total * 100) / 100;
  });

  protected readonly precioSugerido = computed(() => {
    const costo = this.costoTotalReceta();
    const margin = this.ganancia();
    return Math.round(costo * margin * 100) / 100;
  });

  ngOnInit() {
    this.loadProductos();
    this.loadIngredientes();
  }

  loadProductos() {
    this.api.getProductos().subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  loadIngredientes() {
    this.api.getIngredientes().subscribe({
      next: (data) => this.ingredientes.set(data),
      error: (err) => console.error('Error al cargar ingredientes:', err)
    });
  }

  openNewForm() {
    this.isEditing.set(false);
    this.formTitle.set('Nuevo Producto');
    this.editId.set(null);
    this.nombre.set('');
    this.ganancia.set(1.5);
    this.esRelleno.set(false);
    this.recetaItems.set([]);
    this.showForm.set(true);
  }

  openEditForm(producto: Producto) {
    this.isEditing.set(true);
    this.formTitle.set('Editar Producto');
    this.editId.set(producto.id);
    this.nombre.set(producto.nombre);
    this.ganancia.set(producto.ganancia);
    this.esRelleno.set(producto.es_relleno);
    
    // Map existing recipes to builder items
    const items: RecipeBuilderItem[] = (producto.recetas || []).map(r => ({
      ingrediente_id: r.ingrediente_id,
      cantidad: r.cantidad
    }));
    this.recetaItems.set(items);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  addRecipeItem() {
    if (this.ingredientes().length === 0) {
      alert('Primero debes registrar ingredientes en el sistema.');
      return;
    }
    
    const newItem: RecipeBuilderItem = {
      ingrediente_id: this.ingredientes()[0].id,
      cantidad: 0.1 // default quantity
    };
    
    this.recetaItems.update(items => [...items, newItem]);
  }

  removeRecipeItem(index: number) {
    this.recetaItems.update(items => items.filter((_, i) => i !== index));
  }

  updateItemIngredient(index: number, val: string) {
    this.recetaItems.update(items => {
      const updated = [...items];
      updated[index].ingrediente_id = +val;
      return updated;
    });
  }

  updateItemCantidad(index: number, val: string) {
    this.recetaItems.update(items => {
      const updated = [...items];
      updated[index].cantidad = parseFloat(val) || 0;
      return updated;
    });
  }

  saveProducto() {
    if (!this.nombre().trim()) {
      alert('El nombre es requerido.');
      return;
    }

    if (this.recetaItems().length === 0) {
      alert('El producto debe tener al menos un ingrediente en su receta.');
      return;
    }

    const payload = {
      nombre: this.nombre().toUpperCase(),
      ganancia: this.ganancia(),
      es_relleno: this.esRelleno(),
      recetas: this.recetaItems()
    };

    if (this.isEditing() && this.editId()) {
      this.api.updateProducto(this.editId()!, payload as any).subscribe({
        next: () => {
          this.loadProductos();
          this.closeForm();
        },
        error: (err) => console.error('Error al actualizar producto:', err)
      });
    } else {
      this.api.createProducto(payload as any).subscribe({
        next: () => {
          this.loadProductos();
          this.closeForm();
        },
        error: (err) => console.error('Error al crear producto:', err)
      });
    }
  }

  deleteProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.api.deleteProducto(id).subscribe({
        next: () => {
          this.loadProductos();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          alert('No se pudo eliminar el producto. Puede que esté relacionado a ventas existentes.');
        }
      });
    }
  }

  getIngredientUnit(ingredienteId: number): string {
    const ing = this.ingredientes().find(i => i.id === +ingredienteId);
    return ing?.unidad_medida?.nombre || 'U';
  }
}
