import { DataSource } from 'typeorm';
export declare class ProductosController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAll(): Promise<{
        id: number;
        nombre: string;
        ganancia: number;
        es_relleno: boolean;
        precio: number;
        recetas: {
            id: number;
            cantidad: number;
            ingrediente_id: number;
            ingrediente: {
                id: number;
                nombre: string;
                costo: number;
                unidad_medida: string;
            } | null;
        }[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        ganancia: number;
        es_relleno: boolean;
        precio: number;
        recetas: {
            id: number;
            cantidad: number;
            ingrediente_id: number;
            ingrediente: {
                id: number;
                nombre: string;
                costo: number;
                unidad_medida: string;
            } | null;
        }[];
    }>;
    create(body: any): Promise<{
        id: number;
        nombre: string;
        ganancia: number;
        es_relleno: boolean;
        precio: number;
        recetas: {
            id: number;
            cantidad: number;
            ingrediente_id: number;
            ingrediente: {
                id: number;
                nombre: string;
                costo: number;
                unidad_medida: string;
            } | null;
        }[];
    }>;
    update(id: number, body: any): Promise<{
        id: number;
        nombre: string;
        ganancia: number;
        es_relleno: boolean;
        precio: number;
        recetas: {
            id: number;
            cantidad: number;
            ingrediente_id: number;
            ingrediente: {
                id: number;
                nombre: string;
                costo: number;
                unidad_medida: string;
            } | null;
        }[];
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    private mapEntityToDto;
}
