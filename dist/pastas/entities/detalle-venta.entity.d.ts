import { Venta } from './venta.entity';
import { Producto } from './producto.entity';
export declare class DetalleVenta {
    id: number;
    venta: Venta;
    cantidad: number | null;
    producto: Producto;
}
