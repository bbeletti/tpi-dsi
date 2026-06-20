import { Controller, Get, Post, Body, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { Bolsin } from '../entities/bolsin.entity';
import { Empleado } from '../entities/empleado.entity';
import { Sesion } from '../entities/sesion.entity';

class GpsTrackerSimulator {
  // XTR-4500L: returns JSON string
  static getBolsinLocation(apiKey: string, numeroBolsin: number, cmOrigenCodigo: string): string {
    // Central coordinates: -34.6037, -58.3816
    // Simulate bag moving towards Norte (CM-02)
    const lat = -34.5815;
    const lng = -58.4112;
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
    // Simulate bag moving
    const lat = -34.5710;
    const lng = -58.4320;
    const updateTime = new Date().toISOString();
    return `${numeroBolsin},${lat},${lng},${updateTime}`;
  }

  // GeoPulse MTR-900: returns a matrix
  static fetchCargoPositions(apiKey: string, numeroBolsin: number): any[][] {
    const lat = -34.6120;
    const lng = -58.3750;
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
    // 1. Resolve current active session (fechaHoraEgreso is null)
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

    // Filter: state 'Enviado' and origin CM matches user's CM
    const bolsinesEnviados = allBolsines.filter(b => 
      b.esTuCMOrigen(cmUsuario) && b.sosEnviado()
    );

    // 3. For each bolsin, fetch location from the GPS tracker simulator and look up GCM email
    const result = [];
    const empleadoRepo = this.dataSource.getRepository(Empleado);

    for (const bolsin of bolsinesEnviados) {
      let lat = 0;
      let lng = 0;
      let updateTime = '';
      let trackerModel = '';

      // Determine GPS Tracker model based on number
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

      // Lookup destination GCM email
      const empleadosDestino = await empleadoRepo.find({
        where: { cm: { id: bolsin.destino.id } },
        relations: { rol: true, cm: true }
      });
      const gcm = empleadosDestino.find(e => e.sosGCM());
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
    @Body() body: {
      numeroBolsin: number;
      latitud: number;
      longitud: number;
      fechaHoraActualizacion: string;
      emailDestino: string;
    }
  ) {
    const { numeroBolsin, latitud, longitud, fechaHoraActualizacion, emailDestino } = body;
    
    // Simulate sending email (Caso de Uso 31)
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
