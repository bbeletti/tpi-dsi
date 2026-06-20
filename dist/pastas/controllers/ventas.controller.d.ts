import { DataSource } from 'typeorm';
export declare class VentasController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAll(): Promise<{
        id: number;
        fecha: string;
        cliente: {
            id: number;
            nombre: string;
        } | null;
        detalle: {
            id: number;
            cantidad: number | null;
            producto_id: number;
            producto_nombre: string;
            precio_unitario: number;
            subtotal: number;
        }[];
        total: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        fecha: string;
        cliente: {
            id: number;
            nombre: string;
        } | null;
        detalle: {
            id: number;
            cantidad: number | null;
            producto_id: number;
            producto_nombre: string;
            precio_unitario: number;
            subtotal: number;
        }[];
        total: number;
    }>;
    create(body: any): Promise<{
        id: number;
        fecha: string;
        cliente: {
            id: number;
            nombre: string;
        } | null;
        detalle: {
            id: number;
            cantidad: number | null;
            producto_id: number;
            producto_nombre: string;
            precio_unitario: number;
            subtotal: number;
        }[];
        total: number;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    private mapEntityToDto;
}
