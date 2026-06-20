import { Entity, Column, OneToMany } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';
import { Receta } from './receta.entity';

@Entity('pastas_producto')
export class Producto extends BaseNombre {
  @Column('decimal', { precision: 15, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  }})
  ganancia: number;

  @Column({ default: false })
  es_relleno: boolean;

  @OneToMany(() => Receta, (receta) => receta.producto, { cascade: true, eager: true })
  recetas: Receta[];

  get precio(): number {
    if (!this.recetas) return 0;
    const total = this.recetas.reduce((sum, receta) => {
      const recetaCosto = receta.ingrediente?.costo ?? 0;
      return sum + (receta.cantidad * recetaCosto);
    }, 0);
    return Math.round(total * this.ganancia * 100) / 100;
  }
}
