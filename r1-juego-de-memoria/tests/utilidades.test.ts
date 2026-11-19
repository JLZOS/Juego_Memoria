import { describe, expect, it } from "vitest";
import { leerEntero } from "@/lib/config";
import { describirTiempo, duracionISO, formatearFecha, formatearTiempo } from "@/lib/formato";

describe("leerEntero", () => {
  it("usa el valor por defecto si falta o no es entero, y limita el rango", () => {
    expect(leerEntero(undefined, 800, 100, 5000)).toBe(800);
    expect(leerEntero("  ", 800, 100, 5000)).toBe(800);
    expect(leerEntero("abc", 800, 100, 5000)).toBe(800);
    expect(leerEntero("1.5", 800, 100, 5000)).toBe(800);
    expect(leerEntero("1200", 800, 100, 5000)).toBe(1200);
    expect(leerEntero("10", 800, 100, 5000)).toBe(100);
    expect(leerEntero("99999", 800, 100, 5000)).toBe(5000);
  });
});

describe("formato de tiempo", () => {
  it("formatea segundos como m:ss, texto legible e ISO 8601", () => {
    expect(formatearTiempo(0)).toBe("0:00");
    expect(formatearTiempo(65)).toBe("1:05");
    expect(formatearTiempo(-3)).toBe("0:00");
    expect(describirTiempo(1)).toBe("1 segundo");
    expect(describirTiempo(45)).toBe("45 segundos");
    expect(describirTiempo(60)).toBe("1 minuto");
    expect(describirTiempo(125)).toBe("2 minutos y 5 segundos");
    expect(describirTiempo(61)).toBe("1 minuto y 1 segundo");
    expect(duracionISO(65)).toBe("PT1M5S");
  });

  it("formatea fechas en español", () => {
    expect(formatearFecha("2026-11-19T12:00:00.000Z")).toMatch(/2026/);
  });
});
