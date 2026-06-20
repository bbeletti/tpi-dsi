import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { CM } from './entities/cm.entity';
import { Empleado } from './entities/empleado.entity';
import { Usuario } from './entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { EstadoBolsin } from './entities/estado-bolsin.entity';
import { CambioEstadoBolsin } from './entities/cambio-estado-bolsin.entity';
import { Bolsin } from './entities/bolsin.entity';

// Controllers
import { BolsinesController } from './controllers/bolsines.controller';
import { SeguimientoController } from './controllers/seguimiento.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rol,
      CM,
      Empleado,
      Usuario,
      Sesion,
      EstadoBolsin,
      CambioEstadoBolsin,
      Bolsin,
    ]),
  ],
  controllers: [
    BolsinesController,
    SeguimientoController,
  ],
  exports: [TypeOrmModule],
})
export class PastasModule {}
