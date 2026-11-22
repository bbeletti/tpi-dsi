import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CM } from './cm.entity';
import { CambioEstadoBolsin } from './cambio-estado-bolsin.entity';

@Entity('bolsin')
export class Bolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ name: 'numero_bolsin' })
  numeroBolsin: number;

  @Column({ name: 'numero_precinto', length: 100 })
  numeroPrecinto: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => value ? parseFloat(value) : 0,
  }})
  peso: number;

  @ManyToOne(() => CM, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'origen_id' })
  origen: CM;

  @ManyToOne(() => CM, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'destino_id' })
  destino: CM;

  @OneToMany(() => CambioEstadoBolsin, (cambio) => cambio.bolsin, { cascade: true, eager: true })
  cambiosEstado: CambioEstadoBolsin[];

  esTuCMOrigen(cm: CM): boolean {
    return this.origen && cm && this.origen.id === cm.id;
  }

  obtenerCMDestino(): CM {
    return this.destino;
  }

  obtenerNumeroBolsin(): number {
    return this.numeroBolsin;
  }

  obtenerNroPrecinto(): string {
    return this.numeroPrecinto;
  }

  sosEnviado(): boolean {
    if (!this.cambiosEstado || this.cambiosEstado.length === 0) return false;
    const cambioActual = this.cambiosEstado.find((c) => c.sosActual());
    return cambioActual ? cambioActual.sosEnviado() : false;
  }
}
