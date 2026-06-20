import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { Receta } from '../entities/receta.entity';
import { Ingrediente } from '../entities/ingrediente.entity';

@Controller('api/productos')
export class ProductosController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async findAll() {
    const productos = await this.dataSource.getRepository(Producto).find({
      relations: { recetas: { ingrediente: { unidad_medida: true } } },
      order: { id: 'DESC' },
    });
    return productos.map(p => this.mapEntityToDto(p));
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const producto = await this.dataSource.getRepository(Producto).findOne({
      where: { id },
      relations: { recetas: { ingrediente: { unidad_medida: true } } },
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return this.mapEntityToDto(producto);
  }


  @Post()
  async create(@Body() body: any) {
    const repo = this.dataSource.getRepository(Producto);
    const producto = new Producto();
    producto.nombre = body.nombre;
    producto.ganancia = parseFloat(body.ganancia) || 0;
    producto.es_relleno = !!body.es_relleno;

    // Save product first so we have an ID for relations if needed (cascade can handle it, but it's safe)
    const savedProducto = await repo.save(producto);

    if (body.recetas && Array.isArray(body.recetas)) {
      const recetas = body.recetas.map((r: any) => {
        const receta = new Receta();
        receta.cantidad = parseFloat(r.cantidad) || 0;
        receta.ingrediente = { id: r.ingrediente_id } as Ingrediente;
        receta.producto = savedProducto;
        return receta;
      });
      await this.dataSource.getRepository(Receta).save(recetas);
    }

    // Fetch again to return full object with calculations
    return this.findOne(savedProducto.id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    const repo = this.dataSource.getRepository(Producto);
    const producto = await repo.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    producto.nombre = body.nombre;
    producto.ganancia = parseFloat(body.ganancia) || 0;
    producto.es_relleno = !!body.es_relleno;

    const savedProducto = await repo.save(producto);

    // Delete old recipes
    await this.dataSource.getRepository(Receta).delete({ producto: { id } });

    // Insert new recipes
    if (body.recetas && Array.isArray(body.recetas)) {
      const recetas = body.recetas.map((r: any) => {
        const receta = new Receta();
        receta.cantidad = parseFloat(r.cantidad) || 0;
        receta.ingrediente = { id: r.ingrediente_id } as Ingrediente;
        receta.producto = savedProducto;
        return receta;
      });
      await this.dataSource.getRepository(Receta).save(recetas);
    }

    return this.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const repo = this.dataSource.getRepository(Producto);
    const producto = await repo.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    // Delete recipes first (since cascade restrict/cascade onDelete is configured, we clean up manually for safety)
    await this.dataSource.getRepository(Receta).delete({ producto: { id } });
    await repo.delete(id);
    return { success: true };
  }

  private mapEntityToDto(p: Producto) {
    return {
      id: p.id,
      nombre: p.nombre,
      ganancia: p.ganancia,
      es_relleno: p.es_relleno,
      precio: p.precio, // getter
      recetas: (p.recetas || []).map(r => ({
        id: r.id,
        cantidad: r.cantidad,
        ingrediente_id: r.ingrediente?.id,
        ingrediente: r.ingrediente ? {
          id: r.ingrediente.id,
          nombre: r.ingrediente.nombre,
          costo: r.ingrediente.costo,
          unidad_medida: r.ingrediente.unidad_medida?.nombre,
        } : null,
      })),
    };
  }
}
