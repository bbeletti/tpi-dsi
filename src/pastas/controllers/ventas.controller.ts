import { Controller, Get, Post, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Venta } from '../entities/venta.entity';
import { DetalleVenta } from '../entities/detalle-venta.entity';
import { Cliente } from '../entities/cliente.entity';
import { Producto } from '../entities/producto.entity';

@Controller('api/ventas')
export class VentasController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async findAll() {
    const ventas = await this.dataSource.getRepository(Venta).find({
      relations: {
        cliente: true,
        detalle: {
          producto: {
            recetas: {
              ingrediente: true
            }
          }
        }
      },
      order: { id: 'DESC' },
    });

    return ventas.map(v => this.mapEntityToDto(v));
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const venta = await this.dataSource.getRepository(Venta).findOne({
      where: { id },
      relations: {
        cliente: true,
        detalle: {
          producto: {
            recetas: {
              ingrediente: true
            }
          }
        }
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return this.mapEntityToDto(venta);
  }


  @Post()
  async create(@Body() body: any) {
    const repoVenta = this.dataSource.getRepository(Venta);
    const repoDetalle = this.dataSource.getRepository(DetalleVenta);

    const venta = new Venta();
    venta.fecha = body.fecha;
    venta.cliente = { id: body.cliente_id } as Cliente;

    const savedVenta = await repoVenta.save(venta);

    if (body.detalle && Array.isArray(body.detalle)) {
      const detalles = body.detalle.map((d: any) => {
        const detalle = new DetalleVenta();
        detalle.venta = savedVenta;
        detalle.producto = { id: d.producto_id } as Producto;
        detalle.cantidad = parseFloat(d.cantidad) || 0;
        return detalle;
      });
      await repoDetalle.save(detalles);
    }

    return this.findOne(savedVenta.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const repoVenta = this.dataSource.getRepository(Venta);
    const repoDetalle = this.dataSource.getRepository(DetalleVenta);

    const venta = await repoVenta.findOneBy({ id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    // Delete details first
    await repoDetalle.delete({ venta: { id } });
    await repoVenta.delete(id);

    return { success: true };
  }

  private mapEntityToDto(v: Venta) {
    let totalVenta = 0;
    const detallesMapped = (v.detalle || []).map(d => {
      const precioUnitario = d.producto?.precio ?? 0;
      const subtotal = (d.cantidad ?? 0) * precioUnitario;
      totalVenta += subtotal;

      return {
        id: d.id,
        cantidad: d.cantidad,
        producto_id: d.producto?.id,
        producto_nombre: d.producto?.nombre,
        precio_unitario: precioUnitario,
        subtotal: Math.round(subtotal * 100) / 100,
      };
    });

    return {
      id: v.id,
      fecha: v.fecha,
      cliente: v.cliente ? {
        id: v.cliente.id,
        nombre: v.cliente.nombre,
      } : null,
      detalle: detallesMapped,
      total: Math.round(totalVenta * 100) / 100,
    };
  }
}
