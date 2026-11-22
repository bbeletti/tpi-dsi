import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cm')
export class CM {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 200 })
  direccion: string;

  @Column({ length: 254 })
  email: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 50 })
  telefono: string;

  @Column({ type: 'float', nullable: true })
  latitud: number;

  @Column({ type: 'float', nullable: true })
  longitud: number;

  obtenerNombre(): string {
    return this.nombre;
  }
}
