import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './cliente.entity';
import { DetalleVenta } from './detalle-venta.entity';

@Entity('pastas_venta')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  fecha: string;

  @ManyToOne(() => Cliente, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalle: DetalleVenta[];
}
