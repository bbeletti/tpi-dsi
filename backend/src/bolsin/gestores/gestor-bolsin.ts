import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { CM } from '../entities/cm.entity';
import { Empleado } from '../entities/empleado.entity';
import { Ruta } from '../entities/ruta.entity';
import { Sesion } from '../entities/sesion.entity';
import { IAgregado } from '../iterator/i-agregado';
import { IIterador } from '../iterator/i-iterador';
import { IteradorBolsines } from '../iterator/iterador-bolsines';
import { GpsTracker } from '../gps/gps-tracker';
import {
  CMUbicacionDto,
  ConsultarSeguimientoDto,
  NotificarUbicacionDto,
  PosicionBolsinDto,
} from '../dto/seguimiento.dto';

/** Datos de un bolsín enviado que el gestor obtiene en el loop de buscarBolsinEnviado(). */
interface BolsinEnviado {
  bolsin: Bolsin;
  numeroBolsin: number;
  numeroPrecinto: string;
  cmDestino: string;
}

/** Datos de localización informados por el GPS Tracker (pasos 4 y 5). */
interface DatLocBolsin {
  latitud: number;
  longitud: number;
  fechaHora: string;
  modelo: string;
}

/**
 * «control» GestorBolsin - CU 36 Consultar seguimiento de bolsines.
 * Agregado de los bolsines en el patrón Iterator (IAgregado).
 * Alcance por request: guarda el estado del caso de uso en sus atributos.
 */
@Injectable({ scope: Scope.REQUEST })
export class GestorBolsin implements IAgregado<Bolsin> {
  private cmUsLog: CM;
  private bolsines: Bolsin[] = [];
  private bolsinEnviado: BolsinEnviado[] = [];
  private datLocBolsin = new Map<number, DatLocBolsin>();
  private bolsinSeleccionado: BolsinEnviado | null = null;

  constructor(private readonly dataSource: DataSource) {}

  // ---------- Pasos 1 a 6: consultar la ubicación de los bolsines ----------

  /** Paso 1: el EB selecciona la opción para consultar la ubicación de los bolsines. */
  async opcionConsUbiBolsin(): Promise<ConsultarSeguimientoDto> {
    await this.buscarCmUsLog();
    await this.buscarBolsinEnviado();
    this.obtenerDatLocBolsin();
    const bolsines = await this.obtenerMapaPosicionBolsin();
    return { cmUsuario: this.ubicacionDe(this.cmUsLog), bolsines };
  }

  /** Paso 2: busca la CM del usuario logueado a partir de la sesión activa. */
  async buscarCmUsLog(): Promise<void> {
    const sesion = await this.dataSource.getRepository(Sesion).findOne({
      where: { fechaHoraEgreso: IsNull() },
      relations: { usuario: { empleado: { cm: true } } },
      order: { id: 'DESC' },
    });
    if (!sesion) {
      throw new NotFoundException(
        'No hay ninguna sesión activa en el sistema.',
      );
    }

    const cm = sesion.buscarCMdeUsuarioLogueado();
    if (!cm) {
      throw new NotFoundException(
        'El usuario logueado no posee una Comisión Médica asignada.',
      );
    }
    this.cmUsLog = cm;
  }

  /** Patrón Iterator: crea el iterador de bolsines con filtros = [cmUsLog]. */
  crearIterador(elementos: Bolsin[]): IIterador<Bolsin> {
    return new IteradorBolsines(elementos, [this.cmUsLog]);
  }

  /**
   * Paso 3: busca los bolsines en estado Enviado cuya CM origen es la del usuario logueado.
   * Sigue el diagrama de secuencia "Iterator buscarBolsinEnviado".
   * A1: si no hay bolsines enviados, bolsinEnviado queda vacío.
   */
  async buscarBolsinEnviado(): Promise<void> {
    this.bolsines = await this.dataSource.getRepository(Bolsin).find();

    // crearIterador(elementos) -> new(elementos, filtros = [cmUsLog]):IteradorBolsines
    const iterador = this.crearIterador(this.bolsines);
    this.bolsinEnviado = [];

    iterador.primero();
    // loop Bolsines [mientras haFinalizado() = false]
    while (!iterador.haFinalizado()) {
      // elementoActual() -> comprobarFiltro(filtros) -> esTuCMOrigen(cm), sosEnviado()
      const bolsin = iterador.elementoActual();
      if (bolsin) {
        this.bolsinEnviado.push({
          bolsin,
          numeroBolsin: bolsin.obtenerNumeroBolsin(),
          numeroPrecinto: bolsin.obtenerPrecinto(),
          cmDestino: bolsin.obtenerCMDestino(),
        });
      }
      iterador.siguiente();
    }
  }

  /**
   * Pasos 4 y 5: solicita y recibe del GPS Tracker los datos de localización de cada bolsín
   * (Observación 1: XTR-4500L, NavTrack QX-7A o GeoPulse MTR-900).
   * A3: si el GPS no puede informar la ubicación, el bolsín queda sin posición.
   */
  obtenerDatLocBolsin(): void {
    this.datLocBolsin.clear();
    for (const { bolsin, numeroBolsin } of this.bolsinEnviado) {
      try {
        this.datLocBolsin.set(
          numeroBolsin,
          this.consultarGpsTracker(bolsin, numeroBolsin),
        );
      } catch (err) {
        console.warn(
          `A3: el GPS Tracker no pudo informar la ubicación del bolsín ${numeroBolsin}.`,
          err,
        );
      }
    }
  }

  /** Paso 6: arma la posición de los bolsines que el frontend dibuja con Google Maps. */
  async obtenerMapaPosicionBolsin(): Promise<PosicionBolsinDto[]> {
    // Recorridos por carretera precalculados, para dibujar cada bolsín sobre su ruta
    const rutas = await this.dataSource
      .getRepository(Ruta)
      .find({ relations: { origen: true, destino: true } });

    const posiciones: PosicionBolsinDto[] = [];
    for (const { bolsin, numeroBolsin, numeroPrecinto, cmDestino } of this
      .bolsinEnviado) {
      const loc = this.datLocBolsin.get(numeroBolsin);
      if (!loc) continue; // A3: sin ubicación no se puede mostrar en el mapa

      posiciones.push({
        id: bolsin.id,
        numeroBolsin,
        numeroPrecinto,
        peso: bolsin.peso,
        fechaCreacion: bolsin.fechaCreacion.toISOString(),
        origen: this.ubicacionDe(bolsin.origen),
        destino: { ...this.ubicacionDe(bolsin.destino), nombre: cmDestino },
        latitud: loc.latitud,
        longitud: loc.longitud,
        fechaHoraActualizacion: loc.fechaHora,
        trackerModel: loc.modelo,
        ruta:
          rutas.find((r) => r.esDelTramo(bolsin.origen, bolsin.destino))
            ?.recorrido ?? null,
      });
    }
    return posiciones;
  }

  // ---------- Pasos 7 a 11: notificar la ubicación al GCM destino ----------

  /** Paso 7: el EB selecciona un bolsín del mapa. A2: el bolsín no está entre los enviados. */
  async tomarSelecBolsin(numeroBolsin: number): Promise<void> {
    await this.buscarCmUsLog();
    await this.buscarBolsinEnviado();

    this.bolsinSeleccionado =
      this.bolsinEnviado.find((b) => b.numeroBolsin === numeroBolsin) ?? null;
    if (!this.bolsinSeleccionado) {
      throw new NotFoundException(
        `No se encuentra un bolsín enviado con el número ${numeroBolsin}.`,
      );
    }
  }

  /**
   * Pasos 9 y 10: el EB confirmó el envío del correo; el sistema busca el email del GCM
   * de la CM destino y llama al CU 31 (paso 11).
   */
  async tomarSelecEnviarEmail(): Promise<NotificarUbicacionDto> {
    const seleccionado = this.bolsinSeleccionado;
    if (!seleccionado) {
      throw new NotFoundException('No hay un bolsín seleccionado.');
    }

    const empleados = await this.dataSource.getRepository(Empleado).find({
      where: { cm: { id: seleccionado.bolsin.destino.id } },
      relations: { rol: true, cm: true },
    });
    const gcm = empleados.find((e) => e.sosGCM());
    if (!gcm) {
      throw new NotFoundException(
        `La ${seleccionado.cmDestino} no tiene un Gerente de Comisión Médica registrado.`,
      );
    }

    const resultado = this.llamarCU31(seleccionado, gcm.obtenerEmail());
    this.finCU();
    return resultado;
  }

  /** Paso 11: incluye al CU 31 Notificar ubicación de bolsín (simulado: el email se registra en el log). */
  llamarCU31(
    seleccionado: BolsinEnviado,
    emailGCM: string,
  ): NotificarUbicacionDto {
    const loc = this.consultarGpsTracker(
      seleccionado.bolsin,
      seleccionado.numeroBolsin,
    );

    console.log('--------------------------------------------------');
    console.log('[CU 31 Notificar ubicación de bolsín] ENVIANDO EMAIL...');
    console.log(`Para: ${emailGCM}`);
    console.log(
      `Asunto: Actualización de Ubicación - Bolsín Nro ${seleccionado.numeroBolsin}`,
    );
    console.log(
      `  El bolsín número ${seleccionado.numeroBolsin} se encuentra en las siguientes coordenadas:`,
    );
    console.log(`  Latitud: ${loc.latitud}`);
    console.log(`  Longitud: ${loc.longitud}`);
    console.log(`  Última Actualización de GPS: ${loc.fechaHora}`);
    console.log('--------------------------------------------------');

    return {
      success: true,
      message: `Se notificó la ubicación del bolsín ${seleccionado.numeroBolsin} a ${emailGCM}.`,
    };
  }

  finCU(): void {
    this.bolsinSeleccionado = null;
  }

  // ---------- Auxiliares ----------

  /** Consulta al modelo de GPS Tracker del bolsín y normaliza la respuesta de cada endpoint. */
  private consultarGpsTracker(
    bolsin: Bolsin,
    numeroBolsin: number,
  ): DatLocBolsin {
    if ([10101, 60606, 90909].includes(numeroBolsin)) {
      const raw = GpsTracker.getBolsinLocation(
        'KEY-XTR-99',
        numeroBolsin,
        bolsin.origen.codigo,
      );
      // JSON en formato cadena: [{ numeroBolsin, latitud, longitud, fechaHora }]
      const [data] = JSON.parse(raw) as {
        latitud: number;
        longitud: number;
        fechaHora: string;
      }[];
      return {
        latitud: data.latitud,
        longitud: data.longitud,
        fechaHora: data.fechaHora,
        modelo: 'XTR-4500L',
      };
    }
    if ([20202, 70707, 12121].includes(numeroBolsin)) {
      const raw = GpsTracker.retrieveTrackingData(
        'KEY-NAV-88',
        numeroBolsin,
        bolsin.destino.codigo,
      );
      const parts = raw.split(',');
      return {
        latitud: parseFloat(parts[1]),
        longitud: parseFloat(parts[2]),
        fechaHora: parts[3],
        modelo: 'NavTrack QX-7A',
      };
    }
    const raw = GpsTracker.fetchCargoPositions(
      'KEY-GEO-77',
      numeroBolsin,
    );
    // Matriz: [[numeroBolsin, latitud, longitud, fechaHora]]
    const [, latitud, longitud, fechaHora] = raw[0];
    return {
      latitud: Number(latitud),
      longitud: Number(longitud),
      fechaHora: String(fechaHora),
      modelo: 'GeoPulse MTR-900',
    };
  }

  private ubicacionDe(cm: CM): CMUbicacionDto {
    return {
      id: cm.id,
      nombre: cm.obtenerNombre(),
      codigo: cm.codigo,
      latitud: cm.latitud,
      longitud: cm.longitud,
    };
  }
}
