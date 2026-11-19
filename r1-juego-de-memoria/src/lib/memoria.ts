import type { Carta } from "./juegoReducer";

/** Fisher–Yates: devuelve una copia barajada de forma uniforme; no modifica el original. */
export function barajar<T>(arreglo: readonly T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Toma `parejas` símbolos, los duplica y los baraja. Los ids corresponden a la posición final. */
export function crearCartas(
  simbolos: readonly string[],
  parejas: number,
  aleatorio: () => number = Math.random,
): Carta[] {
  const unicos = [...new Set(simbolos)];
  if (!Number.isInteger(parejas) || parejas < 1 || parejas > unicos.length) {
    throw new RangeError(
      `Se pidieron ${parejas} parejas, pero el tema solo tiene ${unicos.length} símbolos distintos.`,
    );
  }
  const elegidos = unicos.slice(0, parejas);
  return barajar([...elegidos, ...elegidos], aleatorio).map((simbolo, id) => ({
    id,
    simbolo,
    descubierta: false,
  }));
}
