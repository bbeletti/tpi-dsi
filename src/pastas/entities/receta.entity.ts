import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { Ingrediente } from './ingrediente.entity';

@Entity('pastas_receta')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 3, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  }})
  cantidad: number;

  @ManyToOne(() => Ingrediente, { onDelete: 'RESTRICT', nullable: false, eager: true })
  @JoinColumn({ name: 'ingrediente_id' })
  ingrediente: Ingrediente;

  @ManyToOne(() => Producto, (producto) => producto.recetas, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
