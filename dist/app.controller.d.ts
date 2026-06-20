import { AppService } from './app.service';
import { DataSource } from 'typeorm';
export declare class AppController {
    private readonly appService;
    private readonly dataSource;
    constructor(appService: AppService, dataSource: DataSource);
    getHello(): string;
    getPastasTest(): Promise<{
        id: number;
        nombre: string;
        ganancia: number;
        es_relleno: boolean;
        recetas: {
            id: number;
            cantidad: number;
            ingrediente: {
                id: number;
                nombre: string;
                costo: number;
                unidad_medida: string;
            };
        }[];
        precioCalculado: number;
    }[]>;
}
