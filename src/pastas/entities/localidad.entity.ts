import { Entity } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';

@Entity('pastas_localidad')
export class Localidad extends BaseNombre {}
