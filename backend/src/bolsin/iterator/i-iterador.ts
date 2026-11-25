/**
 * Patrón Iterator - «interface» IIterador.
 * Recorre los elementos de un agregado y devuelve como elemento actual
 * solo los que cumplen los filtros (comprobarFiltro).
 */
export interface IIterador<T> {
  primero(): void;
  siguiente(): void;
  haFinalizado(): boolean;
  /** Devuelve el elemento actual si cumple los filtros; si no, null. */
  elementoActual(): T | null;
  comprobarFiltro(filtros: unknown[]): boolean;
}
