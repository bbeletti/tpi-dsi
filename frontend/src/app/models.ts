export interface CM {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  email: string;
  telefono: string;
  latitud: number | null;
  longitud: number | null;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  rol?: Rol;
  cm?: CM;
}

export interface Usuario {
  id: number;
  usuarioActivo: string;
  empleadoActivo: boolean;
  empleado?: Empleado;
}

export interface Sesion {
  id: number;
  fechaHoraIngreso: string;
  fechaHoraEgreso: string | null;
  usuario?: Usuario;
}

export interface EstadoBolsin {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CambioEstadoBolsin {
  id: number;
  fechaHoraInicio: string;
  fechaHoraFin: string | null;
  UsLog: string;
  estadoBolsin?: EstadoBolsin;
  sosActual: boolean;
  sosEnviado: boolean;
}

export interface Bolsin {
  id: number;
  fechaCreacion: string;
  numeroBolsin: number;
  numeroPrecinto: string;
  peso: number;
  origen?: CM;
  destino?: CM;
  cambiosEstado?: CambioEstadoBolsin[];
  sosEnviado: boolean;
}

export interface BolsinSeguimiento {
  id: number;
  numeroBolsin: number;
  numeroPrecinto: string;
  peso: number;
  fechaCreacion: string;
  origen: CMUbicacion;
  destino: CMUbicacion;
  latitud: number;
  longitud: number;
  fechaHoraActualizacion: string;
  trackerModel: string;
  emailDestino: string;
  /** Recorrido por carretera precalculado, puntos [latitud, longitud] de CM origen a CM destino. */
  ruta: [number, number][] | null;
}

export interface CMUbicacion {
  id: number;
  nombre: string;
  codigo: string;
  latitud: number | null;
  longitud: number | null;
}

export interface SeguimientoResponse {
  cmUsuario: CMUbicacion | null;
  bolsines: BolsinSeguimiento[];
}
