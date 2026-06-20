import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { Producto } from './pastas/entities/producto.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('pastas-test')
  async getPastasTest() {
    const productoRepo = this.dataSource.getRepository(Producto);
    const productos = await productoRepo.find();
    return productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      ganancia: p.ganancia,
      es_relleno: p.es_relleno,
      recetas: p.recetas.map((r) => ({
        id: r.id,
        cantidad: r.cantidad,
        ingrediente: {
          id: r.ingrediente?.id,
          nombre: r.ingrediente?.nombre,
          costo: r.ingrediente?.costo,
          unidad_medida: r.ingrediente?.unidad_medida?.nombre,
        },
      })),
      precioCalculado: p.precio,
    }));
  }
}
