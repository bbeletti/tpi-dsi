/** Respuestas HTTP del CU 36 (contrato con el frontend). No son clases del dominio. */

export interface CMUbicacionDto {
  id: number;
  nombre: string;
  codigo: string;
  latitud: number | null;
  longitud: number | null;
}

/** Posición de un bolsín enviado para mostrar en el mapa (paso 6). */
export interface PosicionBolsinDto {
  id: number;
  numeroBolsin: number;
  numeroPrecinto: string;
  peso: number;
  fechaCreacion: string;
  origen: CMUbicacionDto;
  destino: CMUbicacionDto;
  latitud: number;
  longitud: number;
  fechaHoraActualizacion: string;
  trackerModel: string;
  /** Recorrido por carretera precalculado, puntos [latitud, longitud]. */
  ruta: [number, number][] | null;
}

export interface ConsultarSeguimientoDto {
  cmUsuario: CMUbicacionDto;
  bolsines: PosicionBolsinDto[];
}

/** Pedido de notificación: el EB seleccionó un bolsín y confirmó el envío (pasos 7 y 9). */
export interface NotificarUbicacionBodyDto {
  numeroBolsin: number;
}

export interface NotificarUbicacionDto {
  success: boolean;
  message: string;
}
