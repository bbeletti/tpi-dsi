import { Entity } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';

@Entity('pastas_barrio')
export class Barrio extends BaseNombre {}
