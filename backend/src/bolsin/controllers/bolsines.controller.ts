import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { CM } from '../entities/cm.entity';
import { Empleado } from '../entities/empleado.entity';
import { Usuario } from '../entities/usuario.entity';
import { Sesion } from '../entities/sesion.entity';
import { EstadoBolsin } from '../entities/estado-bolsin.entity';
import { Rol } from '../entities/rol.entity';

@Controller('api')
export class BolsinesController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('bolsines')
  async getBolsines() {
    const repo = this.dataSource.getRepository(Bolsin);
    const bolsines = await repo.find();
    return bolsines.map((b) => ({
      id: b.id,
      numeroBolsin: b.obtenerNumeroBolsin(),
      numeroPrecinto: b.obtenerNroPrecinto(),
      peso: b.peso,
      fechaCreacion: b.fechaCreacion,
      origen: {
        id: b.origen?.id,
        nombre: b.origen?.obtenerNombre(),
        codigo: b.origen?.codigo,
      },
      destino: {
        id: b.destino?.id,
        nombre: b.destino?.obtenerNombre(),
        codigo: b.destino?.codigo,
      },
      sosEnviado: b.sosEnviado(),
      cambiosEstado: b.cambiosEstado?.map((c) => ({
        id: c.id,
        fechaHoraInicio: c.fechaHoraInicio,
        fechaHoraFin: c.fechaHoraFin,
        UsLog: c.UsLog,
        estado: {
          id: c.estadoBolsin?.id,
          nombre: c.estadoBolsin?.nombre,
          descripcion: c.estadoBolsin?.descripcion,
          sosEnviado: c.estadoBolsin?.sosEnviado(),
        },
        sosActual: c.sosActual(),
        sosEnviado: c.sosEnviado(),
      })),
    }));
  }

  @Get('cms')
  async getCMs() {
    return this.dataSource.getRepository(CM).find();
  }

  @Get('empleados')
  async getEmpleados() {
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
  async getUsuarios() {
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
  async getSesiones() {
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
        id: s.buscarCmdeUsuarioLogueado()?.id,
        nombre: s.buscarCmdeUsuarioLogueado()?.obtenerNombre(),
      },
    }));
  }

  @Get('estados')
  async getEstados() {
    return this.dataSource.getRepository(EstadoBolsin).find();
  }

  @Get('roles')
  async getRoles() {
    return this.dataSource.getRepository(Rol).find();
  }
}
