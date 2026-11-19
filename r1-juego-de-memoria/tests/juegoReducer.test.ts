import { describe, expect, it } from "vitest";
import { estadoInicial, juegoReducer, type Carta, type Estado } from "@/lib/juegoReducer";

// Orden conocido: 0 y 2 son pareja (🐶), 1 y 3 son pareja (🐱).
const CARTAS: Carta[] = [
  { id: 0, simbolo: "🐶", descubierta: false },
  { id: 1, simbolo: "🐱", descubierta: false },
  { id: 2, simbolo: "🐶", descubierta: false },
  { id: 3, simbolo: "🐱", descubierta: false },
];

function aplicar(estado: Estado, ...ids: number[]) {
  return ids.reduce((e, id) => juegoReducer(e, { tipo: "voltear", id }), estado);
}

describe("juegoReducer", () => {
  const inicial = estadoInicial(CARTAS);

  it("reiniciar deja un estado limpio en fase inicio", () => {
    const sucio = { ...aplicar(inicial, 0, 1), segundos: 9 };
    const nuevo = juegoReducer(sucio, { tipo: "reiniciar", cartas: CARTAS });
    expect(nuevo).toEqual({
      cartas: CARTAS,
      volteadas: [],
      movimientos: 0,
      segundos: 0,
      fase: "inicio",
    });
    expect(nuevo.cartas).not.toBe(CARTAS);
  });

  it("la primera carta pasa a jugando sin contar movimiento", () => {
    const estado = aplicar(inicial, 0);
    expect(estado.volteadas).toEqual([0]);
    expect(estado.fase).toBe("jugando");
    expect(estado.movimientos).toBe(0);
  });

  it("voltear dos cartas iguales las deja descubiertas y suma un movimiento", () => {
    const estado = aplicar(inicial, 0, 2);
    expect(estado.cartas.filter((c) => c.descubierta).map((c) => c.id)).toEqual([0, 2]);
    expect(estado.volteadas).toEqual([]);
    expect(estado.movimientos).toBe(1);
  });

  it("voltear dos distintas y despachar resolver las oculta", () => {
    const comparando = aplicar(inicial, 0, 1);
    expect(comparando.volteadas).toEqual([0, 1]);
    expect(comparando.movimientos).toBe(1);
    const resuelto = juegoReducer(comparando, { tipo: "resolver" });
    expect(resuelto.volteadas).toEqual([]);
    expect(resuelto.cartas.every((c) => !c.descubierta)).toBe(true);
  });

  it("ignora una tercera carta mientras se comparan dos", () => {
    const comparando = aplicar(inicial, 0, 1);
    expect(juegoReducer(comparando, { tipo: "voltear", id: 2 })).toBe(comparando);
  });

  it("un clic doble sobre la misma carta no cuenta como segunda carta", () => {
    const una = aplicar(inicial, 0);
    expect(juegoReducer(una, { tipo: "voltear", id: 0 })).toBe(una);
  });

  it("ignora cartas ya descubiertas y ids inexistentes", () => {
    const conPareja = aplicar(inicial, 0, 2);
    expect(juegoReducer(conPareja, { tipo: "voltear", id: 0 })).toBe(conPareja);
    expect(juegoReducer(conPareja, { tipo: "voltear", id: 99 })).toBe(conPareja);
  });

  it("al descubrir todas la fase es fin y ya no acepta más acciones", () => {
    const fin = aplicar(inicial, 0, 2, 1, 3);
    expect(fin.fase).toBe("fin");
    expect(fin.movimientos).toBe(2);
    expect(fin.cartas.every((c) => c.descubierta)).toBe(true);
    expect(juegoReducer(fin, { tipo: "tic" })).toBe(fin);
    expect(juegoReducer(fin, { tipo: "voltear", id: 1 })).toBe(fin);
  });

  it("tic solo suma segundos mientras se juega", () => {
    expect(juegoReducer(inicial, { tipo: "tic" })).toBe(inicial);
    const jugando = aplicar(inicial, 0);
    expect(juegoReducer(jugando, { tipo: "tic" }).segundos).toBe(1);
  });

  it("resolver sin dos cartas volteadas no cambia nada", () => {
    const una = aplicar(inicial, 0);
    expect(juegoReducer(una, { tipo: "resolver" })).toBe(una);
  });

  it("ignora acciones desconocidas", () => {
    const desconocida = { tipo: "otra" } as unknown as Parameters<typeof juegoReducer>[1];
    expect(juegoReducer(inicial, desconocida)).toBe(inicial);
  });

  it("nunca modifica el estado anterior", () => {
    const estados: Estado[] = [inicial, aplicar(inicial, 0), aplicar(inicial, 0, 1)];
    const acciones = [
      { tipo: "voltear", id: 2 },
      { tipo: "voltear", id: 1 },
      { tipo: "resolver" },
      { tipo: "tic" },
      { tipo: "reiniciar", cartas: CARTAS },
    ] as const;
    for (const estado of estados) {
      for (const accion of acciones) {
        const copia = structuredClone(estado);
        juegoReducer(estado, accion);
        expect(estado).toEqual(copia);
      }
    }
    const antesDeGanar = aplicar(inicial, 0, 2, 1);
    const copia = structuredClone(antesDeGanar);
    juegoReducer(antesDeGanar, { tipo: "voltear", id: 3 });
    expect(antesDeGanar).toEqual(copia);
  });
});
