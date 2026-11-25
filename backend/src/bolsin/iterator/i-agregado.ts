import { IIterador } from './i-iterador';

/**
 * Patrón Iterator - «interface» IAgregado.
 * La implementan GestorBolsin y Bolsin.
 */
export interface IAgregado<T> {
  crearIterador(elementos: T[]): IIterador<T>;
}
