import { DataSource } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
export declare class ClientesController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAll(): Promise<Cliente[]>;
    findOne(id: number): Promise<Cliente>;
    create(body: any): Promise<Cliente>;
    update(id: number, body: any): Promise<Cliente>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    private mapBodyToEntity;
}
