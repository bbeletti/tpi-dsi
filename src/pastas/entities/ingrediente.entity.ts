import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';
import { UnidadMedida } from './unidad-medida.entity';

@Entity('pastas_ingrediente')
export class Ingrediente extends BaseNombre {
  @Column('decimal', { precision: 15, scale: 2, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  }})
  costo: number;

  @ManyToOne(() => UnidadMedida, { onDelete: 'RESTRICT', nullable: false, eager: true })
  @JoinColumn({ name: 'unidad_medida_id' })
  unidad_medida: UnidadMedida;
}
