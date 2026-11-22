import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  esGCM(): boolean {
    return this.nombre
      ? this.nombre.toLowerCase().includes('gcm') || this.nombre.toLowerCase().includes('gestor')
      : false;
  }
}
