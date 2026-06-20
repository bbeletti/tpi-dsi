import { AppService } from './app.service';
import { DataSource } from 'typeorm';
export declare class AppController {
    private readonly appService;
    private readonly dataSource;
    constructor(appService: AppService, dataSource: DataSource);
    getHello(): string;
    getBolsinesTest(): Promise<{
        id: number;
        numeroBolsin: number;
        numeroPrecinto: string;
        peso: number;
        fechaCreacion: Date;
        esTuCMOrigenDeOrigen: boolean;
        esTuCMOrigenDeDestino: boolean;
        cmDestinoNombre: string;
        sosEnviado: boolean;
    }[]>;
}
