import { Controller, Get, Post, Body, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { Empleado } from '../entities/empleado.entity';
import { Sesion } from '../entities/sesion.entity';

// Última posición reportada por el GPS de cada bolsín (simula los dispositivos reales).
// Cada bolsín está sobre una ciudad de la ruta entre su CM origen y su CM destino.
const POSICIONES_GPS: Record<number, { lat: number; lng: number }> = {
  10101: { lat: -32.4075, lng: -63.2402 }, // Buenos Aires → Córdoba: Villa María, Córdoba
  20202: { lat: -34.0981, lng: -59.0286 }, // Buenos Aires → Rosario: Zárate, Buenos Aires
  30303: { lat: -33.295, lng: -66.3356 }, // Córdoba → Mendoza: San Luis
  40404: { lat: -27.7951, lng: -64.2615 }, // Rosario → Tucumán: Santiago del Estero
  50505: { lat: -36.3132, lng: -57.6792 }, // Mar del Plata → Buenos Aires: Dolores, Buenos Aires
  60606: { lat: -33.1232, lng: -64.3493 }, // Buenos Aires → Mendoza: Río Cuarto, Córdoba
  70707: { lat: -31.2503, lng: -61.4867 }, // Buenos Aires → Tucumán: Rafaela, Santa Fe
  80808: { lat: -36.6203, lng: -64.2906 }, // Buenos Aires → Neuquén: Santa Rosa, La Pampa
  90909: { lat: -35.575, lng: -58.009 }, // Buenos Aires → Mar del Plata: Chascomús, Buenos Aires
  11111: { lat: -30.9817, lng: -64.0942 }, // Buenos Aires → Salta: Jesús María, Córdoba
  12121: { lat: -31.3929, lng: -58.0209 }, // Buenos Aires → Posadas: Concordia, Entre Ríos
  13131: { lat: -38.7183, lng: -62.2663 }, // Buenos Aires → Comodoro Rivadavia: Bahía Blanca (mismo camión que 14141)
  14141: { lat: -38.7183, lng: -62.2663 }, // Buenos Aires → Comodoro Rivadavia: Bahía Blanca (mismo camión que 13131)
};

function posicionDe(numeroBolsin: number) {
  return POSICIONES_GPS[numeroBolsin] ?? { lat: -34.6037, lng: -58.3816 };
}

class GpsTrackerSimulator {
  // XTR-4500L: returns JSON string
  static getBolsinLocation(apiKey: string, numeroBolsin: number, cmOrigenCodigo: string): string {
    const { lat, lng } = posicionDe(numeroBolsin);
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
    const { lat, lng } = posicionDe(numeroBolsin);
    const updateTime = new Date().toISOString();
    return `${numeroBolsin},${lat},${lng},${updateTime}`;
  }

  // GeoPulse MTR-900: returns a matrix
  static fetchCargoPositions(apiKey: string, numeroBolsin: number): any[][] {
    const { lat, lng } = posicionDe(numeroBolsin);
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
      if ([10101, 60606, 90909].includes(bolsin.numeroBolsin)) {
        trackerModel = 'XTR-4500L';
        const raw = GpsTrackerSimulator.getBolsinLocation('KEY-XTR-99', bolsin.numeroBolsin, bolsin.origen.codigo);
        const data = JSON.parse(raw)[0];
        lat = data.latitud;
        lng = data.longitud;
        updateTime = data.fechaHora;
      } else if ([20202, 70707, 12121].includes(bolsin.numeroBolsin)) {
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
          codigo: bolsin.origen.codigo,
          latitud: bolsin.origen.latitud,
          longitud: bolsin.origen.longitud
        },
        destino: {
          id: bolsin.destino.id,
          nombre: bolsin.destino.obtenerNombre(),
          codigo: bolsin.destino.codigo,
          latitud: bolsin.destino.latitud,
          longitud: bolsin.destino.longitud
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
        codigo: cmUsuario.codigo,
        latitud: cmUsuario.latitud,
        longitud: cmUsuario.longitud
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
