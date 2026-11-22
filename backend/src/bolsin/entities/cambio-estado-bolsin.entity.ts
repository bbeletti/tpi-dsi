import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoBolsin } from './estado-bolsin.entity';
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
  UsLog: string;

  @ManyToOne(() => EstadoBolsin, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estado_id' })
  estadoBolsin: EstadoBolsin;

  @ManyToOne(() => Bolsin, (bolsin) => bolsin.cambiosEstado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bolsin_id' })
  bolsin: Bolsin;

  sosEnviado(): boolean {
    return this.estadoBolsin ? this.estadoBolsin.sosEnviado() : false;
  }

  sosActual(): boolean {
    return this.fechaHoraFin === null;
  }
}
