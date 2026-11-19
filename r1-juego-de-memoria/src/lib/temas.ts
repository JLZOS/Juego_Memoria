export const TAMANOS = [12, 16, 24] as const;
export type Tamano = (typeof TAMANOS)[number];

export function esTamano(valor: unknown): valor is Tamano {
  return TAMANOS.includes(valor as Tamano);
}

export function parejasDe(tamano: Tamano) {
  return tamano / 2;
}

export const TEMAS = {
  animales: {
    nombre: "Animales",
    simbolos: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"],
  },
  comida: {
    nombre: "Comida",
    simbolos: ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥑", "🥕", "🌽", "🍕", "🍔", "🍩"],
  },
  deportes: {
    nombre: "Deportes",
    simbolos: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "⛳"],
  },
} as const satisfies Record<string, { nombre: string; simbolos: readonly string[] }>;

export type IdTema = keyof typeof TEMAS;
export const IDS_TEMA = Object.keys(TEMAS) as IdTema[];

export function esIdTema(valor: unknown): valor is IdTema {
  return typeof valor === "string" && Object.hasOwn(TEMAS, valor);
}
