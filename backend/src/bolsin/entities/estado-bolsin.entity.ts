import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_bolsin')
export class EstadoBolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, name: 'descripcion', nullable: true })
  descripcion: string;

  sosEnviado(): boolean {
    return this.nombre ? this.nombre.toLowerCase().includes('enviado') : false;
  }
}
