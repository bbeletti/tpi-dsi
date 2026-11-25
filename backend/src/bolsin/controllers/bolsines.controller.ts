import { Body, Controller, Get, Post } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { CM } from '../entities/cm.entity';
import { Empleado } from '../entities/empleado.entity';
import { Usuario } from '../entities/usuario.entity';
import { Sesion } from '../entities/sesion.entity';
import { Estado } from '../entities/estado.entity';
import { Rol } from '../entities/rol.entity';
import {
  BolsinDto,
  EmpleadoDto,
  SesionDto,
  UsuarioDto,
} from '../dto/bolsines.dto';
import type {
  ConsultarSeguimientoDto,
  NotificarUbicacionBodyDto,
  NotificarUbicacionDto,
} from '../dto/seguimiento.dto';
import { GestorBolsin } from '../gestores/gestor-bolsin';

@Controller('api')
export class BolsinesController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly gestorBolsin: GestorBolsin,
  ) {}

  // ---------- CU 36 Consultar seguimiento de bolsines: delega en el «control» GestorBolsin ----------

  // Pasos 1 a 6
  @Get('seguimiento/consultar')
  consultarSeguimiento(): Promise<ConsultarSeguimientoDto> {
    return this.gestorBolsin.opcionConsUbiBolsin();
  }

  // Pasos 7 a 11: la pantalla envía el bolsín seleccionado una vez que el EB confirmó el envío
  @Post('seguimiento/notificar')
  async notificarUbicacion(
    @Body() body: NotificarUbicacionBodyDto,
  ): Promise<NotificarUbicacionDto> {
    await this.gestorBolsin.tomarSelecBolsin(Number(body.numeroBolsin));
    return this.gestorBolsin.tomarSelecEnviarEmail();
  }

  // ---------- Consultas de las entidades ----------

  @Get('bolsines')
  async getBolsines(): Promise<BolsinDto[]> {
    const repo = this.dataSource.getRepository(Bolsin);
    const bolsines = await repo.find();
    return bolsines.map((b) => ({
      id: b.id,
      numeroBolsin: b.obtenerNumeroBolsin(),
      numeroPrecinto: b.obtenerPrecinto(),
      peso: b.peso,
      fechaCreacion: b.fechaCreacion,
      origen: {
        id: b.origen.id,
        nombre: b.origen.obtenerNombre(),
        codigo: b.origen.codigo,
      },
      destino: {
        id: b.destino.id,
        nombre: b.obtenerCMDestino(),
        codigo: b.destino.codigo,
      },
      sosEnviado: b.sosEnviado(),
      cambioEstado: (b.cambioEstado ?? []).map((c) => ({
        id: c.id,
        fechaHoraInicio: c.fechaHoraInicio,
        fechaHoraFin: c.fechaHoraFin,
        usLog: c.usLog,
        estado: {
          id: c.estado.id,
          nombre: c.estado.nombre,
          descripcion: c.estado.descripcion,
          sosEnviado: c.estado.sosEnviado(),
        },
        sosActual: c.sosActual(),
        sosEnviado: c.sosEnviado(),
      })),
    }));
  }

  @Get('cms')
  async getCMs(): Promise<CM[]> {
    return this.dataSource.getRepository(CM).find();
  }

  @Get('empleados')
  async getEmpleados(): Promise<EmpleadoDto[]> {
    const repo = this.dataSource.getRepository(Empleado);
    const empleados = await repo.find();
    return empleados.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      email: e.obtenerEmail(),
      legajo: e.legajo,
      rol: {
        id: e.rol?.id,
        nombre: e.rol?.nombre,
        sosGCM: e.sosGCM(),
      },
      cm: {
        id: e.cm?.id,
        nombre: e.cm?.obtenerNombre(),
        codigo: e.cm?.codigo,
      },
    }));
  }

  @Get('usuarios')
  async getUsuarios(): Promise<UsuarioDto[]> {
    const repo = this.dataSource.getRepository(Usuario);
    const usuarios = await repo.find();
    return usuarios.map((u) => ({
      id: u.id,
      usuarioActivo: u.usuarioActivo,
      empleadoActivo: u.empleadoActivo,
      empleado: {
        id: u.empleado?.id,
        nombre: u.empleado?.nombre,
        apellido: u.empleado?.apellido,
      },
      comisionMedica: {
        id: u.obtenerComisionMedica()?.id,
        nombre: u.obtenerComisionMedica()?.obtenerNombre(),
      },
    }));
  }

  @Get('sesiones')
  async getSesiones(): Promise<SesionDto[]> {
    const repo = this.dataSource.getRepository(Sesion);
    const sesiones = await repo.find();
    return sesiones.map((s) => ({
      id: s.id,
      fechaHoraIngreso: s.fechaHoraIngreso,
      fechaHoraEgreso: s.fechaHoraEgreso,
      usuario: {
        id: s.usuario?.id,
        usuarioActivo: s.usuario?.usuarioActivo,
      },
      cmDeUsuarioLogueado: {
        id: s.buscarCMdeUsuarioLogueado()?.id,
        nombre: s.buscarCMdeUsuarioLogueado()?.obtenerNombre(),
      },
    }));
  }

  @Get('estados')
  async getEstados(): Promise<Estado[]> {
    return this.dataSource.getRepository(Estado).find();
  }

  @Get('roles')
  async getRoles(): Promise<Rol[]> {
    return this.dataSource.getRepository(Rol).find();
  }
}
