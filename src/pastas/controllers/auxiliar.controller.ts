import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Barrio } from '../entities/barrio.entity';
import { Localidad } from '../entities/localidad.entity';
import { Provincia } from '../entities/provincia.entity';
import { UnidadMedida } from '../entities/unidad-medida.entity';

@Controller('api')
export class AuxiliarController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('barrios')
  async getBarrios() {
    return this.dataSource.getRepository(Barrio).find({ order: { nombre: 'ASC' } });
  }

  @Get('localidades')
  async getLocalidades() {
    return this.dataSource.getRepository(Localidad).find({ order: { nombre: 'ASC' } });
  }

  @Get('provincias')
  async getProvincias() {
    return this.dataSource.getRepository(Provincia).find({ order: { nombre: 'ASC' } });
  }

  @Get('unidades-medida')
  async getUnidadesMedida() {
    return this.dataSource.getRepository(UnidadMedida).find({ order: { nombre: 'ASC' } });
  }
}
