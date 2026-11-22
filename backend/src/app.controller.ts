import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { Bolsin } from './bolsin/entities/bolsin.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Configuración pública para el frontend. La API key de Google Maps JavaScript
  // es visible en el navegador por diseño; se protege restringiéndola por dominio
  // (HTTP referrer) en Google Cloud Console.
  @Get('api/config')
  getConfig() {
    return {
      googleMapsApiKey: this.configService.get<string>(
        'GOOGLE_MAPS_API_KEY',
        '',
      ),
      // DEMO_MAP_ID es el Map ID de prueba de Google; habilita los Advanced Markers.
      googleMapsMapId: this.configService.get<string>(
        'GOOGLE_MAPS_MAP_ID',
        'DEMO_MAP_ID',
      ),
    };
  }

  @Get('bolsines-test')
  async getBolsinesTest() {
    const bolsinRepo = this.dataSource.getRepository(Bolsin);
    const bolsines = await bolsinRepo.find();

    return bolsines.map((b) => {
      return {
        id: b.id,
        numeroBolsin: b.obtenerNumeroBolsin(),
        numeroPrecinto: b.obtenerNroPrecinto(),
        peso: b.peso,
        fechaCreacion: b.fechaCreacion,
        esTuCMOrigenDeOrigen: b.esTuCMOrigen(b.origen),
        esTuCMOrigenDeDestino: b.esTuCMOrigen(b.destino),
        cmDestinoNombre: b.obtenerCMDestino()?.obtenerNombre(),
        sosEnviado: b.sosEnviado(),
      };
    });
  }
}
