import { Entity } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';

@Entity('pastas_provincia')
export class Provincia extends BaseNombre {}
