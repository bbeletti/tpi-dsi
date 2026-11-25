/** Respuestas HTTP de las consultas de apoyo (BolsinesController). */

export interface CMResumenDto {
  id: number;
  nombre: string;
  codigo: string;
}

export interface EstadoDto {
  id: number;
  nombre: string;
  descripcion: string;
  sosEnviado: boolean;
}

export interface CambioEstadoBolsinDto {
  id: number;
  fechaHoraInicio: Date;
  fechaHoraFin: Date | null;
  usLog: string;
  estado: EstadoDto;
  sosActual: boolean;
  sosEnviado: boolean;
}

export interface BolsinDto {
  id: number;
  numeroBolsin: number;
  numeroPrecinto: string;
  peso: number;
  fechaCreacion: Date;
  origen: CMResumenDto;
  destino: CMResumenDto;
  sosEnviado: boolean;
  cambioEstado: CambioEstadoBolsinDto[];
}

/** Referencia opcional a otra entidad (la relación puede no estar cargada). */
export interface ReferenciaDto {
  id?: number;
  nombre?: string;
}

export interface EmpleadoDto {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  rol: ReferenciaDto & { sosGCM: boolean };
  cm: ReferenciaDto & { codigo?: string };
}

export interface UsuarioDto {
  id: number;
  usuarioActivo: string;
  empleadoActivo: boolean;
  empleado: ReferenciaDto & { apellido?: string };
  comisionMedica: ReferenciaDto;
}

export interface SesionDto {
  id: number;
  fechaHoraIngreso: Date;
  fechaHoraEgreso: Date | null;
  usuario: { id?: number; usuarioActivo?: string };
  cmDeUsuarioLogueado: ReferenciaDto;
}
