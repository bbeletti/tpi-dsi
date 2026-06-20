import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ingrediente } from '../entities/ingrediente.entity';
import { UnidadMedida } from '../entities/unidad-medida.entity';

@Controller('api/ingredientes')
export class IngredientesController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async findAll() {
    return this.dataSource.getRepository(Ingrediente).find({
      relations: { unidad_medida: true },
      order: { id: 'DESC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const ingrediente = await this.dataSource.getRepository(Ingrediente).findOne({
      where: { id },
      relations: { unidad_medida: true },
    });
    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }
    return ingrediente;
  }


  @Post()
  async create(@Body() body: any) {
    const repo = this.dataSource.getRepository(Ingrediente);
    const ingrediente = new Ingrediente();
    this.mapBodyToEntity(ingrediente, body);
    return repo.save(ingrediente);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    const repo = this.dataSource.getRepository(Ingrediente);
    const ingrediente = await repo.findOneBy({ id });
    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }
    this.mapBodyToEntity(ingrediente, body);
    return repo.save(ingrediente);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const repo = this.dataSource.getRepository(Ingrediente);
    const result = await repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }
    return { success: true };
  }

  private mapBodyToEntity(ingrediente: Ingrediente, body: any) {
    ingrediente.nombre = body.nombre;
    ingrediente.costo = parseFloat(body.costo) || 0;
    if (body.unidad_medida_id) {
      ingrediente.unidad_medida = { id: body.unidad_medida_id } as UnidadMedida;
    }
  }
}
