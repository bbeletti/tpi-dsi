import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { CM } from './entities/cm.entity';
import { Empleado } from './entities/empleado.entity';
import { Usuario } from './entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { Estado } from './entities/estado.entity';
import { CambioEstadoBolsin } from './entities/cambio-estado-bolsin.entity';
import { Bolsin } from './entities/bolsin.entity';
import { Ruta } from './entities/ruta.entity';

// Controllers
import { BolsinesController } from './controllers/bolsines.controller';
import { GestorBolsin } from './gestores/gestor-bolsin';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rol,
      CM,
      Empleado,
      Usuario,
      Sesion,
      Estado,
      CambioEstadoBolsin,
      Bolsin,
      Ruta,
    ]),
  ],
  controllers: [
    BolsinesController,
  ],
  providers: [GestorBolsin],
  exports: [TypeOrmModule],
})
export class BolsinModule {}
