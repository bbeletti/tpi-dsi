import { IIterador } from './i-iterador';
import { Bolsin } from '../entities/bolsin.entity';
import { CM } from '../entities/cm.entity';

/**
 * «iterator» IteradorBolsines.
 * filtros = [cmUsLog]: pasan los bolsines cuya CM origen es la del usuario
 * logueado y cuyo estado actual es Enviado.
 */
export class IteradorBolsines implements IIterador<Bolsin> {
  private elementos: Bolsin[];
  private posicionActual = 0;
  private filtros: unknown[];

  // new(elementos:Object[], filtros:Object[]):IteradorBolsines
  constructor(elementos: Bolsin[], filtros: unknown[]) {
    this.elementos = elementos;
    this.filtros = filtros;
  }

  primero(): void {
    this.posicionActual = 0;
  }

  siguiente(): void {
    this.posicionActual++;
  }

  haFinalizado(): boolean {
    return this.posicionActual >= this.elementos.length;
  }

  elementoActual(): Bolsin | null {
    return this.comprobarFiltro(this.filtros)
      ? this.elementos[this.posicionActual]
      : null;
  }

  comprobarFiltro(filtros: unknown[]): boolean {
    const bolsin = this.elementos[this.posicionActual];
    const [cmUsLog] = filtros as [CM];
    return bolsin.esTuCMOrigen(cmUsLog) && bolsin.sosEnviado();
  }
}
