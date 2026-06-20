import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';
import { CM } from './cm.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 254 })
  email: string;

  @Column({ length: 50 })
  legajo: string;

  @ManyToOne(() => Rol, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => CM, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cm_id' })
  cm: CM;

  esTuCM(cm: CM): boolean {
    return this.cm && cm && this.cm.id === cm.id;
  }

  sosGCM(): boolean {
    return this.rol ? this.rol.esGCM() : false;
  }

  obtenerEmail(): string {
    return this.email;
  }
}
