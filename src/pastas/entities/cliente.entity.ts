import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';
import { Barrio } from './barrio.entity';
import { Localidad } from './localidad.entity';
import { Provincia } from './provincia.entity';
import { User } from './user.entity';

@Entity('pastas_cliente')
@Index('pastas_cliente_unico', ['numero_documento', 'user'])
export class Cliente extends BaseNombre {
  @Column('bigint', { name: 'numero_documento', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseInt(value, 10) : null,
  }})
  numero_documento: number;

  @Column({ length: 200, nullable: true })
  direccion: string;

  @Column('bigint', { nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseInt(value, 10) : null,
  }})
  celular: number;

  @Column('bigint', { nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseInt(value, 10) : null,
  }})
  telefono: number;

  @Column({ length: 254, nullable: true })
  email: string;

  @ManyToOne(() => Barrio, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'barrio_id' })
  barrio: Barrio;

  @ManyToOne(() => Localidad, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'localidad_id' })
  localidad: Localidad;

  @ManyToOne(() => Provincia, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'provincia_id' })
  provincia: Provincia;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
