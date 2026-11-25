import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CM } from './cm.entity';

/**
 * Recorrido por carretera entre dos comisiones médicas, precalculado con
 * scripts/generar-rutas.mjs y cargado por el seed. Solo se usa para dibujar
 * el recorrido de los bolsines en el mapa.
 */
@Entity('ruta')
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CM, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'origen_id' })
  origen: CM;

  @ManyToOne(() => CM, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destino_id' })
  destino: CM;

  @Column({ name: 'distancia_km' })
  distanciaKm: number;

  /** Puntos [latitud, longitud] del recorrido, de la CM origen a la CM destino. */
  @Column({ type: 'jsonb' })
  recorrido: [number, number][];

  esDelTramo(origen: CM, destino: CM): boolean {
    return this.origen?.id === origen.id && this.destino?.id === destino.id;
  }
}
