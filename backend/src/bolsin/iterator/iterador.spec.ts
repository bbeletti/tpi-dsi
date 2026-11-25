import { Bolsin } from '../entities/bolsin.entity';
import { CambioEstadoBolsin } from '../entities/cambio-estado-bolsin.entity';
import { CM } from '../entities/cm.entity';
import { Estado } from '../entities/estado.entity';
import { IteradorBolsines } from './iterador-bolsines';

function cm(id: number): CM {
  return Object.assign(new CM(), { id });
}

function cambio(nombreEstado: string, actual: boolean): CambioEstadoBolsin {
  return Object.assign(new CambioEstadoBolsin(), {
    estado: Object.assign(new Estado(), { nombre: nombreEstado }),
    fechaHoraFin: actual ? null : new Date(),
  });
}

function bolsin(
  numero: number,
  origen: CM,
  cambios: CambioEstadoBolsin[],
): Bolsin {
  return Object.assign(new Bolsin(), {
    numeroBolsin: numero,
    origen,
    cambioEstado: cambios,
  });
}

function recorrer(elementos: Bolsin[], cmUsLog: CM): number[] {
  const it = new IteradorBolsines(elementos, [cmUsLog]);
  const encontrados: number[] = [];
  it.primero();
  while (!it.haFinalizado()) {
    const b = it.elementoActual();
    if (b) encontrados.push(b.obtenerNumeroBolsin());
    it.siguiente();
  }
  return encontrados;
}

describe('Patrón Iterator - CU 36', () => {
  const cmLog = cm(1);

  it('Bolsin.sosEnviado usa solo el cambio de estado actual', () => {
    expect(
      bolsin(1, cmLog, [
        cambio('Creado', false),
        cambio('Enviado', true),
      ]).sosEnviado(),
    ).toBe(true);
    expect(
      bolsin(2, cmLog, [
        cambio('Enviado', false),
        cambio('Recibido', true),
      ]).sosEnviado(),
    ).toBe(false);
    expect(bolsin(3, cmLog, []).sosEnviado()).toBe(false);
  });

  it('IteradorBolsines filtra por CM origen del usuario y estado Enviado', () => {
    const elementos = [
      bolsin(10, cmLog, [cambio('Enviado', true)]),
      bolsin(20, cm(2), [cambio('Enviado', true)]),
      bolsin(30, cmLog, [cambio('Enviado', false), cambio('Recibido', true)]),
      bolsin(40, cmLog, [cambio('Creado', false), cambio('Enviado', true)]),
    ];
    expect(recorrer(elementos, cmLog)).toEqual([10, 40]);
  });

  it('con una colección vacía finaliza de inmediato', () => {
    expect(recorrer([], cmLog)).toEqual([]);
  });
});
