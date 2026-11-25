import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Estado } from './estado.entity';
import { Bolsin } from './bolsin.entity';

@Entity('cambio_estado_bolsin')
export class CambioEstadoBolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'fecha_hora_inicio' })
  fechaHoraInicio: Date;

  @Column({ type: 'timestamp', name: 'fecha_hora_fin', nullable: true })
  fechaHoraFin: Date | null;

  @Column({ name: 'us_log', length: 150 })
  usLog: string;

  @ManyToOne(() => Estado, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;

  @ManyToOne(() => Bolsin, (bolsin) => bolsin.cambioEstado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bolsin_id' })
  bolsin: Bolsin;

  sosEnviado(): boolean {
    return this.estado ? this.estado.sosEnviado() : false;
  }

  sosActual(): boolean {
    return this.fechaHoraFin === null;
  }
}
