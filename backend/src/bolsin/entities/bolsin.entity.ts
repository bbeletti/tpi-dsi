import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CM } from './cm.entity';
import { CambioEstadoBolsin } from './cambio-estado-bolsin.entity';
import { IAgregado } from '../iterator/i-agregado';
import { IIterador } from '../iterator/i-iterador';
import { IteradorCambioEstado } from '../iterator/iterador-cambio-estado';

@Entity('bolsin')
export class Bolsin implements IAgregado<CambioEstadoBolsin> {
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
  cambioEstado: CambioEstadoBolsin[];

  esTuCMOrigen(cm: CM): boolean {
    return this.origen && cm && this.origen.id === cm.id;
  }

  obtenerCMDestino(): string {
    return this.destino.obtenerNombre();
  }

  obtenerNumeroBolsin(): number {
    return this.numeroBolsin;
  }

  obtenerPrecinto(): string {
    return this.numeroPrecinto;
  }

  // Patrón Iterator: Bolsin es el agregado de sus cambios de estado
  crearIterador(elementos: CambioEstadoBolsin[]): IIterador<CambioEstadoBolsin> {
    return new IteradorCambioEstado(elementos, []);
  }

  // Secuencia: recorre los cambios de estado con IteradorCambioEstado hasta
  // encontrar el actual y le pregunta si es Enviado (actual -> Estado.sosEnviado()).
  sosEnviado(): boolean {
    const iterador = this.crearIterador(this.cambioEstado ?? []);
    let enviado = false;

    iterador.primero();
    while (!iterador.haFinalizado()) {
      const actual = iterador.elementoActual();
      if (actual) {
        enviado = actual.sosEnviado();
      }
      iterador.siguiente();
    }

    return enviado;
  }
}
