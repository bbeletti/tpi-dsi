import { IIterador } from './i-iterador';
import { CambioEstadoBolsin } from '../entities/cambio-estado-bolsin.entity';

/**
 * «iterator» IteradorCambioEstado.
 * Pasa solo el cambio de estado actual (sosActual).
 */
export class IteradorCambioEstado implements IIterador<CambioEstadoBolsin> {
  private elementos: CambioEstadoBolsin[];
  private posicionActual = 0;
  private filtros: unknown[];

  // new(elementos:Object[], filtros:Object[]):IteradorCambioEstado
  constructor(elementos: CambioEstadoBolsin[], filtros: unknown[]) {
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

  elementoActual(): CambioEstadoBolsin | null {
    return this.comprobarFiltro(this.filtros)
      ? this.elementos[this.posicionActual]
      : null;
  }

  // Sin filtros externos: el criterio es ser el cambio de estado actual.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  comprobarFiltro(_filtros: unknown[]): boolean {
    return this.elementos[this.posicionActual].sosActual();
  }
}
