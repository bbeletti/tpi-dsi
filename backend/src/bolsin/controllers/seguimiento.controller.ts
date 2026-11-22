import { Controller, Get, Post, Body, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { Empleado } from '../entities/empleado.entity';
import { Sesion } from '../entities/sesion.entity';

class GpsTrackerSimulator {
  // XTR-4500L: returns JSON string
  static getBolsinLocation(apiKey: string, numeroBolsin: number, cmOrigenCodigo: string): string {
    // Bolsin 10101: CM Central -> CM Norte (25% progress)
    const lat = -34.6078;
    const lng = -58.3837;
    const updateTime = new Date().toISOString();
    return JSON.stringify([
      {
        numeroBolsin,
        latitud: lat,
        longitud: lng,
        fechaHora: updateTime
      }
    ]);
  }

  // NavTrack QX-7A: returns comma separated values
  static retrieveTrackingData(apiKey: string, numeroBolsin: number, cmDestinoCodigo: string): string {
    // Bolsin 20202: CM Central -> CM Norte (60% progress)
    const lat = -34.5855;
    const lng = -58.4146;
    const updateTime = new Date().toISOString();
    return `${numeroBolsin},${lat},${lng},${updateTime}`;
  }

  // GeoPulse MTR-900: returns a matrix
  static fetchCargoPositions(apiKey: string, numeroBolsin: number): any[][] {
    let lat = -34.6050; // Bolsin 30303: CM Norte -> CM Sur (45% progress - same position as 40404)
    let lng = -58.4275;
    if (numeroBolsin === 40404) {
      // Bolsin 40404: CM Norte -> CM Sur (45% progress - same position as 30303)
      lat = -34.6050;
      lng = -58.4275;
    } else if (numeroBolsin === 50505) {
      // Bolsin 50505: CM Sur -> CM Central (50% progress)
      lat = -34.6419;
      lng = -58.3808;
    }
    const updateTime = new Date().toISOString();
    return [
      [numeroBolsin, lat, lng, updateTime]
    ];
  }
}

@Controller('api')
export class SeguimientoController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('seguimiento/consultar')
  async consultarSeguimiento() {
    // CU 36 - Paso 1: El Encargado de Bolsines (EB) selecciona la opción para consultar ubicación en el frontend, lo que inicia la petición HTTP.
    // CU 36 - Paso 2: El sistema busca y muestra la Comisión Médica (CM) del usuario logueado a partir de la sesión activa
    const sesionRepo = this.dataSource.getRepository(Sesion);
    const sesion = await sesionRepo.findOne({
      where: { fechaHoraEgreso: IsNull() },
      relations: {
        usuario: {
          empleado: {
            cm: true
          }
        }
      },
      order: { id: 'DESC' }
    });

    if (!sesion) {
      throw new NotFoundException('No hay ninguna sesión activa en el sistema.');
    }

    const cmUsuario = sesion.buscarCmdeUsuarioLogueado();
    if (!cmUsuario) {
      throw new NotFoundException('El usuario logueado no posee una Comisión Médica asignada.');
    }

    // 2. Fetch all bolsines
    const bolsinRepo = this.dataSource.getRepository(Bolsin);
    const allBolsines = await bolsinRepo.find({
      relations: {
        origen: true,
        destino: true,
        cambiosEstado: {
          estadoBolsin: true
        }
      }
    });

    // CU 36 - Paso 3: El sistema busca los bolsines en estado 'Enviado' cuya Comisión Médica de origen es igual a la del usuario logueado
    const bolsinesEnviados = allBolsines.filter((b: Bolsin) => 
      b.sosEnviado() && b.esTuCMOrigen(cmUsuario)
    );

    // 3. For each bolsin, fetch location from the GPS tracker simulator and look up GCM email
    const result = [];
    const empleadoRepo = this.dataSource.getRepository(Empleado);

    for (const bolsin of bolsinesEnviados) {
      let lat = 0;
      let lng = 0;
      let updateTime = '';
      let trackerModel = '';

      // CU 36 - Pasos 4, 5 y Observación 1: El sistema solicita y recibe del simulador del dispositivo GPS Tracker los datos de localización del bolsín (XTR-4500L, NavTrack QX-7A o GeoPulse MTR-900)
      if (bolsin.numeroBolsin === 10101) {
        trackerModel = 'XTR-4500L';
        const raw = GpsTrackerSimulator.getBolsinLocation('KEY-XTR-99', bolsin.numeroBolsin, bolsin.origen.codigo);
        const data = JSON.parse(raw)[0];
        lat = data.latitud;
        lng = data.longitud;
        updateTime = data.fechaHora;
      } else if (bolsin.numeroBolsin === 20202) {
        trackerModel = 'NavTrack QX-7A';
        const raw = GpsTrackerSimulator.retrieveTrackingData('KEY-NAV-88', bolsin.numeroBolsin, bolsin.destino.codigo);
        const parts = raw.split(',');
        lat = parseFloat(parts[1]);
        lng = parseFloat(parts[2]);
        updateTime = parts[3];
      } else {
        trackerModel = 'GeoPulse MTR-900';
        const raw = GpsTrackerSimulator.fetchCargoPositions('KEY-GEO-77', bolsin.numeroBolsin);
        lat = raw[0][1];
        lng = raw[0][2];
        updateTime = raw[0][3];
      }

      // CU 36 - Paso 10: El sistema busca la dirección de correo electrónico del Gerente de Comisión Médica (GCM) de destino
      const empleadosDestino = await empleadoRepo.find({
        where: { cm: { id: bolsin.destino.id } },
        relations: { rol: true, cm: true }
      });
      const gcm = empleadosDestino.find((e: Empleado) => e.sosGCM());
      const emailDestino = gcm ? gcm.obtenerEmail() : 'gerente.gcm@comision.gob.ar';

      result.push({
        id: bolsin.id,
        numeroBolsin: bolsin.obtenerNumeroBolsin(),
        numeroPrecinto: bolsin.obtenerNroPrecinto(),
        peso: bolsin.peso,
        fechaCreacion: bolsin.fechaCreacion.toISOString(),
        origen: {
          id: bolsin.origen.id,
          nombre: bolsin.origen.obtenerNombre(),
          codigo: bolsin.origen.codigo
        },
        destino: {
          id: bolsin.destino.id,
          nombre: bolsin.destino.obtenerNombre(),
          codigo: bolsin.destino.codigo
        },
        latitud: lat,
        longitud: lng,
        fechaHoraActualizacion: updateTime,
        trackerModel,
        emailDestino
      });
    }

    // CU 36 - Paso 6: El sistema retorna los bolsines y la CM del usuario para que el frontend los muestre sobre el mapa
    return {
      cmUsuario: {
        id: cmUsuario.id,
        nombre: cmUsuario.obtenerNombre(),
        codigo: cmUsuario.codigo
      },
      bolsines: result
    };
  }

  @Post('seguimiento/notificar')
  async notificarUbicacion(
    // CU 36 - Pasos 7 y 9: El Encargado de Bolsines (EB) selecciona un bolsín del mapa y elige la opción de notificar ubicación, disparando esta petición.
    @Body() body: {
      numeroBolsin: number;
      latitud: number;
      longitud: number;
      fechaHoraActualizacion: string;
      emailDestino: string;
    }
  ) {
    const { numeroBolsin, latitud, longitud, fechaHoraActualizacion, emailDestino } = body;
    
    // CU 36 - Pasos 8, 9, 11 (Incluye CU 31): Notificar ubicación de bolsín al Gerente de Comisión Médica (GCM) de destino
    console.log('--------------------------------------------------');
    console.log('[CU 31 Notificar ubicación de bolsín] ENVIANDO EMAIL...');
    console.log(`Para: ${emailDestino}`);
    console.log(`Asunto: Actualización de Ubicación - Bolsín Nro ${numeroBolsin}`);
    console.log(`Contenido:`);
    console.log(`  El bolsín número ${numeroBolsin} se encuentra actualmente en las siguientes coordenadas:`);
    console.log(`  Latitud: ${latitud}`);
    console.log(`  Longitud: ${longitud}`);
    console.log(`  Última Actualización de GPS: ${fechaHoraActualizacion}`);
    console.log('--------------------------------------------------');

    return {
      success: true,
      message: `Se ha notificado con éxito la ubicación del bolsín ${numeroBolsin} a la casilla ${emailDestino}.`
    };
  }
}
