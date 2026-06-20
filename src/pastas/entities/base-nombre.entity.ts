import { PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';

export abstract class BaseNombre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @BeforeInsert()
  @BeforeUpdate()
  toUpperCase() {
    if (this.nombre) {
      this.nombre = this.nombre.toUpperCase();
    }
  }
}
