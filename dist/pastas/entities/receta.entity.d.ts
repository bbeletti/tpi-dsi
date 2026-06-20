import { Producto } from './producto.entity';
import { Ingrediente } from './ingrediente.entity';
export declare class Receta {
    id: number;
    cantidad: number;
    ingrediente: Ingrediente;
    producto: Producto;
}
