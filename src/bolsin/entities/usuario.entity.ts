import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CM } from './cm.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_activo', length: 150 })
  usuarioActivo: string;

  @Column({ name: 'empleado_activo', type: 'boolean', default: true })
  empleadoActivo: boolean;

  @OneToOne(() => Empleado, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  obtenerEmpleado(): Empleado {
    return this.empleado;
  }

  obtenerComisionMedica(): CM | null {
    return this.empleado ? this.empleado.cm : null;
  }
}
