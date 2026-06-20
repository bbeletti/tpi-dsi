import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from './producto.entity';

@Entity('pastas_detalleventa')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.detalle, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column('decimal', { precision: 15, scale: 2, nullable: true, default: null, transformer: {
    to: (value: number | null) => value,
    from: (value: string | null) => value ? parseFloat(value) : null,
  }})
  cantidad: number | null;

  @ManyToOne(() => Producto, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
