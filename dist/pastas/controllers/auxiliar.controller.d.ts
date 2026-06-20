import { DataSource } from 'typeorm';
import { Barrio } from '../entities/barrio.entity';
import { Localidad } from '../entities/localidad.entity';
import { Provincia } from '../entities/provincia.entity';
import { UnidadMedida } from '../entities/unidad-medida.entity';
export declare class AuxiliarController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getBarrios(): Promise<Barrio[]>;
    getLocalidades(): Promise<Localidad[]>;
    getProvincias(): Promise<Provincia[]>;
    getUnidadesMedida(): Promise<UnidadMedida[]>;
}
