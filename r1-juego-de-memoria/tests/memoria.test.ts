import { describe, expect, it } from "vitest";
import { barajar, crearCartas } from "@/lib/memoria";
import { TAMANOS, TEMAS, esIdTema, esTamano, parejasDe } from "@/lib/temas";

function contarSimbolos(cartas: { simbolo: string }[]) {
  const conteo = new Map<string, number>();
  for (const { simbolo } of cartas) conteo.set(simbolo, (conteo.get(simbolo) ?? 0) + 1);
  return conteo;
}

describe("barajar", () => {
  it("no modifica el arreglo original y conserva todos los elementos", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const copia = [...original];
    const resultado = barajar(original);
    expect(original).toEqual(copia);
    expect(resultado).not.toBe(original);
    expect(resultado).toHaveLength(original.length);
    expect([...resultado].sort((a, b) => a - b)).toEqual(copia);
  });

  it("aplica Fisher–Yates: con aleatorio fijo en 0 rota hacia la izquierda", () => {
    expect(barajar([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
  });

  it("produce todas las permutaciones de 3 elementos con frecuencias parecidas", () => {
    const conteo = new Map<string, number>();
    for (let i = 0; i < 6000; i++) {
      const clave = barajar(["a", "b", "c"]).join("");
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
    }
    expect(conteo.size).toBe(6);
    for (const veces of conteo.values()) expect(veces).toBeGreaterThan(800);
  });

  it("acepta arreglos vacíos o de un elemento", () => {
    expect(barajar([])).toEqual([]);
    expect(barajar(["x"])).toEqual(["x"]);
  });
});

describe("crearCartas", () => {
  it("con 6 parejas devuelve 12 cartas y cada símbolo exactamente 2 veces", () => {
    const cartas = crearCartas(TEMAS.animales.simbolos, 6);
    expect(cartas).toHaveLength(12);
    const conteo = contarSimbolos(cartas);
    expect(conteo.size).toBe(6);
    for (const veces of conteo.values()) expect(veces).toBe(2);
  });

  it("crearCartas(…, 8) devuelve 16 cartas con cada símbolo exactamente dos veces", () => {
    const cartas = crearCartas(TEMAS.comida.simbolos, 8);
    expect(cartas).toHaveLength(16);
    for (const veces of contarSimbolos(cartas).values()) expect(veces).toBe(2);
  });

  it("crea cartas boca abajo con ids únicos", () => {
    const cartas = crearCartas(TEMAS.deportes.simbolos, 12);
    expect(new Set(cartas.map((c) => c.id)).size).toBe(24);
    expect(cartas.every((c) => !c.descubierta)).toBe(true);
  });

  it("rechaza un número de parejas imposible", () => {
    expect(() => crearCartas(["🐶", "🐱"], 3)).toThrow(RangeError);
    expect(() => crearCartas(["🐶", "🐱"], 0)).toThrow(RangeError);
    expect(() => crearCartas(["🐶", "🐶", "🐱"], 3)).toThrow(RangeError);
  });
});

describe("temas", () => {
  it.each(Object.entries(TEMAS))("%s tiene al menos 12 símbolos sin repetir", (_, tema) => {
    expect(tema.simbolos.length).toBeGreaterThanOrEqual(12);
    expect(new Set(tema.simbolos).size).toBe(tema.simbolos.length);
  });

  it("todos los tamaños caben en todos los temas", () => {
    for (const tamano of TAMANOS) {
      for (const tema of Object.values(TEMAS)) {
        expect(tema.simbolos.length).toBeGreaterThanOrEqual(parejasDe(tamano));
      }
    }
  });

  it("valida tamaños y temas", () => {
    expect(esTamano(16)).toBe(true);
    expect(esTamano(10)).toBe(false);
    expect(esIdTema("comida")).toBe(true);
    expect(esIdTema("toString")).toBe(false);
    expect(esIdTema(3)).toBe(false);
  });
});
