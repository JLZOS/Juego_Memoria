import { config } from "./config";
import { TAMANOS, parejasDe, type Tamano } from "./temas";

export type Resultado = { movimientos: number; segundos: number; fecha: string };
export type Records = Partial<Record<Tamano, Resultado>>;
export type ResultadoGuardado = "nuevo" | "sin-mejora" | "error";

export const EVENTO_RECORDS = "records-cambiados";

/** Menos movimientos gana; si empatan, menos tiempo. */
export function esMejor(nuevo: Resultado, actual: Resultado | undefined) {
  if (!actual) return true;
  if (nuevo.movimientos !== actual.movimientos) return nuevo.movimientos < actual.movimientos;
  return nuevo.segundos < actual.segundos;
}

function esResultadoValido(valor: unknown, tamano: Tamano): valor is Resultado {
  if (typeof valor !== "object" || valor === null) return false;
  const { movimientos, segundos, fecha } = valor as Record<string, unknown>;
  return (
    Number.isInteger(movimientos) &&
    (movimientos as number) >= parejasDe(tamano) &&
    Number.isInteger(segundos) &&
    (segundos as number) >= 0 &&
    typeof fecha === "string" &&
    !Number.isNaN(Date.parse(fecha))
  );
}

/** Convierte el texto guardado en récords válidos; descarta todo lo que no cumpla el formato. */
export function parsearRecords(texto: string | null): Records {
  if (!texto) return {};
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return {};
  }
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) return {};

  const records: Records = {};
  for (const tamano of TAMANOS) {
    const valor = (datos as Record<string, unknown>)[tamano];
    if (esResultadoValido(valor, tamano)) {
      const { movimientos, segundos, fecha } = valor;
      records[tamano] = { movimientos, segundos, fecha };
    }
  }
  return records;
}

/** Lee el texto crudo; devuelve null si no hay datos o si el almacenamiento está bloqueado. */
export function leerTextoRecords(): string | null {
  try {
    return window.localStorage.getItem(config.claveRecords);
  } catch {
    return null;
  }
}

function avisarCambio() {
  window.dispatchEvent(new Event(EVENTO_RECORDS));
}

export function leerRecords(): Records {
  return parsearRecords(leerTextoRecords());
}

export function guardarRecord(tamano: Tamano, resultado: Resultado): ResultadoGuardado {
  const actuales = leerRecords();
  if (!esMejor(resultado, actuales[tamano])) return "sin-mejora";
  try {
    window.localStorage.setItem(
      config.claveRecords,
      JSON.stringify({ ...actuales, [tamano]: resultado }),
    );
  } catch {
    return "error";
  }
  avisarCambio();
  return "nuevo";
}

export function borrarRecords(): boolean {
  try {
    window.localStorage.removeItem(config.claveRecords);
  } catch {
    return false;
  }
  avisarCambio();
  return true;
}

export function suscribirRecords(alCambiar: () => void) {
  const alAlmacenar = (evento: StorageEvent) => {
    if (evento.key === null || evento.key === config.claveRecords) alCambiar();
  };
  window.addEventListener(EVENTO_RECORDS, alCambiar);
  window.addEventListener("storage", alAlmacenar);
  return () => {
    window.removeEventListener(EVENTO_RECORDS, alCambiar);
    window.removeEventListener("storage", alAlmacenar);
  };
}
