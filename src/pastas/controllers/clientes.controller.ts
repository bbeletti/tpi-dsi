import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { Barrio } from '../entities/barrio.entity';
import { Localidad } from '../entities/localidad.entity';
import { Provincia } from '../entities/provincia.entity';

@Controller('api/clientes')
export class ClientesController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async findAll() {
    return this.dataSource.getRepository(Cliente).find({
      relations: { barrio: true, localidad: true, provincia: true, user: true },
      order: { id: 'DESC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const cliente = await this.dataSource.getRepository(Cliente).findOne({
      where: { id },
      relations: { barrio: true, localidad: true, provincia: true, user: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  @Post()
  async create(@Body() body: any) {
    const repo = this.dataSource.getRepository(Cliente);
    const cliente = new Cliente();
    this.mapBodyToEntity(cliente, body);
    return repo.save(cliente);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    const repo = this.dataSource.getRepository(Cliente);
    const cliente = await repo.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    this.mapBodyToEntity(cliente, body);
    return repo.save(cliente);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const repo = this.dataSource.getRepository(Cliente);
    const result = await repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return { success: true };
  }

  private mapBodyToEntity(cliente: Cliente, body: any) {
    cliente.nombre = body.nombre;
    cliente.numero_documento = body.numero_documento ? parseInt(body.numero_documento, 10) : (null as any);
    cliente.direccion = body.direccion || (null as any);
    cliente.celular = body.celular ? parseInt(body.celular, 10) : (null as any);
    cliente.telefono = body.telefono ? parseInt(body.telefono, 10) : (null as any);
    cliente.email = body.email || (null as any);
    
    if (body.barrio_id) {
      cliente.barrio = { id: body.barrio_id } as Barrio;
    } else {
      cliente.barrio = null as any;
    }

    if (body.localidad_id) {
      cliente.localidad = { id: body.localidad_id } as Localidad;
    } else {
      cliente.localidad = null as any;
    }

    if (body.provincia_id) {
      cliente.provincia = { id: body.provincia_id } as Provincia;
    } else {
      cliente.provincia = null as any;
    }
  }
}

