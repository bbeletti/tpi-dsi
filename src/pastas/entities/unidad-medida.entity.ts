import { Entity } from 'typeorm';
import { BaseNombre } from './base-nombre.entity';

@Entity('pastas_unidadmedida')
export class UnidadMedida extends BaseNombre {}
