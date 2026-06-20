import { DataSource } from 'typeorm';
import { Ingrediente } from '../entities/ingrediente.entity';
export declare class IngredientesController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAll(): Promise<Ingrediente[]>;
    findOne(id: number): Promise<Ingrediente>;
    create(body: any): Promise<Ingrediente>;
    update(id: number, body: any): Promise<Ingrediente>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    private mapBodyToEntity;
}
