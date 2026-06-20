import { BaseNombre } from './base-nombre.entity';
import { Receta } from './receta.entity';
export declare class Producto extends BaseNombre {
    ganancia: number;
    es_relleno: boolean;
    recetas: Receta[];
    get precio(): number;
}
