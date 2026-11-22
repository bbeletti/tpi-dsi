import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { Bolsin } from './bolsin/entities/bolsin.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
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
