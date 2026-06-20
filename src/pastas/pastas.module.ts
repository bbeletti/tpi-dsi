import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entities/provincia.entity';
import { Localidad } from './entities/localidad.entity';
import { Barrio } from './entities/barrio.entity';
import { UnidadMedida } from './entities/unidad-medida.entity';
import { Ingrediente } from './entities/ingrediente.entity';
import { Producto } from './entities/producto.entity';
import { Receta } from './entities/receta.entity';
import { User } from './entities/user.entity';
import { Cliente } from './entities/cliente.entity';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';

// Controllers
import { AuxiliarController } from './controllers/auxiliar.controller';
import { ClientesController } from './controllers/clientes.controller';
import { IngredientesController } from './controllers/ingredientes.controller';
import { ProductosController } from './controllers/productos.controller';
import { VentasController } from './controllers/ventas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provincia,
      Localidad,
      Barrio,
      UnidadMedida,
      Ingrediente,
      Producto,
      Receta,
      User,
      Cliente,
      Venta,
      DetalleVenta,
    ]),
  ],
  controllers: [
    AuxiliarController,
    ClientesController,
    IngredientesController,
    ProductosController,
    VentasController,
  ],
  exports: [TypeOrmModule],
})
export class PastasModule {}

