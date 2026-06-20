import { Cliente } from './cliente.entity';
import { DetalleVenta } from './detalle-venta.entity';
export declare class Venta {
    id: number;
    fecha: string;
    cliente: Cliente;
    detalle: DetalleVenta[];
}
