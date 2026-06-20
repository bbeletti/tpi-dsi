import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CM } from './cm.entity';

@Entity('sesion')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'fecha_hora_ingreso' })
  fechaHoraIngreso: Date;

  @Column({ type: 'timestamp', name: 'fecha_hora_egreso', nullable: true })
  fechaHoraEgreso: Date | null;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  buscarCmdeUsuarioLogueado(): CM | null {
    return this.usuario ? this.usuario.obtenerComisionMedica() : null;
  }
}
