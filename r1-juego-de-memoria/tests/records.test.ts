import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "@/lib/config";
import {
  EVENTO_RECORDS,
  borrarRecords,
  esMejor,
  guardarRecord,
  leerRecords,
  parsearRecords,
  suscribirRecords,
  type Resultado,
} from "@/lib/records";

const FECHA = "2026-11-19T12:00:00.000Z";
const r = (movimientos: number, segundos: number): Resultado => ({
  movimientos,
  segundos,
  fecha: FECHA,
});

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("esMejor", () => {
  it("gana quien tenga menos movimientos y, si empatan, menos tiempo", () => {
    expect(esMejor(r(10, 50), undefined)).toBe(true);
    expect(esMejor(r(9, 90), r(10, 20))).toBe(true);
    expect(esMejor(r(11, 5), r(10, 20))).toBe(false);
    expect(esMejor(r(10, 19), r(10, 20))).toBe(true);
    expect(esMejor(r(10, 20), r(10, 20))).toBe(false);
  });
});

describe("parsearRecords", () => {
  it("ignora JSON roto, otros formatos y entradas inválidas", () => {
    expect(parsearRecords(null)).toEqual({});
    expect(parsearRecords("{no es json")).toEqual({});
    expect(parsearRecords("[1,2,3]")).toEqual({});
    expect(parsearRecords('"texto"')).toEqual({});
    expect(parsearRecords("null")).toEqual({});
    expect(
      parsearRecords(
        JSON.stringify({
          12: { movimientos: "8", segundos: 10, fecha: FECHA },
          16: { movimientos: 3, segundos: 10, fecha: FECHA },
          24: { movimientos: 20, segundos: -1, fecha: FECHA },
          99: r(10, 10),
        }),
      ),
    ).toEqual({});
  });

  it("conserva solo las entradas válidas y descarta campos extra", () => {
    const texto = JSON.stringify({
      12: { ...r(8, 30), extra: true },
      16: { movimientos: 10, segundos: 5, fecha: "no-fecha" },
    });
    expect(parsearRecords(texto)).toEqual({ 12: r(8, 30) });
  });
});

describe("leerRecords y guardarRecord", () => {
  it("guarda el primer resultado y avisa del cambio", () => {
    const escucha = vi.fn();
    window.addEventListener(EVENTO_RECORDS, escucha);
    expect(guardarRecord(12, r(9, 40))).toBe("nuevo");
    expect(leerRecords()).toEqual({ 12: r(9, 40) });
    expect(escucha).toHaveBeenCalledTimes(1);
    window.removeEventListener(EVENTO_RECORDS, escucha);
  });

  it("solo reemplaza el récord si el nuevo es mejor", () => {
    guardarRecord(16, r(12, 60));
    expect(guardarRecord(16, r(13, 10))).toBe("sin-mejora");
    expect(guardarRecord(16, r(12, 50))).toBe("nuevo");
    guardarRecord(24, r(30, 100));
    expect(leerRecords()).toEqual({ 16: r(12, 50), 24: r(30, 100) });
  });

  it("si los datos están dañados los ignora y los reemplaza al guardar", () => {
    localStorage.setItem(config.claveRecords, "{roto");
    expect(leerRecords()).toEqual({});
    expect(guardarRecord(12, r(7, 20))).toBe("nuevo");
    expect(leerRecords()).toEqual({ 12: r(7, 20) });
  });

  it("no lanza errores si localStorage está lleno o bloqueado", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("lleno", "QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    expect(guardarRecord(12, r(8, 8))).toBe("error");
    expect(borrarRecords()).toBe(false);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    expect(leerRecords()).toEqual({});
  });

  it("borrarRecords elimina todo", () => {
    guardarRecord(12, r(8, 8));
    expect(borrarRecords()).toBe(true);
    expect(leerRecords()).toEqual({});
  });
});

describe("suscribirRecords", () => {
  it("reacciona a cambios propios y de otras pestañas, y se puede cancelar", () => {
    const alCambiar = vi.fn();
    const cancelar = suscribirRecords(alCambiar);
    window.dispatchEvent(new Event(EVENTO_RECORDS));
    window.dispatchEvent(new StorageEvent("storage", { key: config.claveRecords }));
    window.dispatchEvent(new StorageEvent("storage", { key: "otra-clave" }));
    expect(alCambiar).toHaveBeenCalledTimes(2);
    cancelar();
    window.dispatchEvent(new Event(EVENTO_RECORDS));
    expect(alCambiar).toHaveBeenCalledTimes(2);
  });
});
