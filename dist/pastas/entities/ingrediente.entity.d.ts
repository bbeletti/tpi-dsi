import { BaseNombre } from './base-nombre.entity';
import { UnidadMedida } from './unidad-medida.entity';
export declare class Ingrediente extends BaseNombre {
    costo: number;
    unidad_medida: UnidadMedida;
}
