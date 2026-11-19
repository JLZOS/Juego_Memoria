export type Carta = { id: number; simbolo: string; descubierta: boolean };

export type Estado = {
  cartas: Carta[];
  volteadas: number[]; // ids de las cartas boca arriba que aún no se resolvieron (0, 1 o 2)
  movimientos: number;
  segundos: number;
  fase: "inicio" | "jugando" | "fin";
};

export type Accion =
  | { tipo: "reiniciar"; cartas: Carta[] }
  | { tipo: "voltear"; id: number }
  | { tipo: "resolver" } // se despacha ~800 ms después de la segunda carta
  | { tipo: "tic" }; // un segundo más

export function estadoInicial(cartas: Carta[]): Estado {
  return {
    cartas: cartas.map((carta) => ({ ...carta })),
    volteadas: [],
    movimientos: 0,
    segundos: 0,
    fase: "inicio",
  };
}

function voltear(estado: Estado, id: number): Estado {
  const { cartas, volteadas, fase } = estado;
  const carta = cartas.find((c) => c.id === id);
  if (
    fase === "fin" ||
    !carta ||
    carta.descubierta ||
    volteadas.includes(id) ||
    volteadas.length >= 2
  ) {
    return estado;
  }

  if (volteadas.length === 0) {
    return { ...estado, volteadas: [id], fase: "jugando" };
  }

  const [primeraId] = volteadas;
  const primera = cartas.find((c) => c.id === primeraId);
  const movimientos = estado.movimientos + 1;

  if (primera?.simbolo !== carta.simbolo) {
    return { ...estado, volteadas: [primeraId, id], movimientos, fase: "jugando" };
  }

  const nuevasCartas = cartas.map((c) =>
    c.id === id || c.id === primeraId ? { ...c, descubierta: true } : c,
  );
  const terminado = nuevasCartas.every((c) => c.descubierta);
  return {
    ...estado,
    cartas: nuevasCartas,
    volteadas: [],
    movimientos,
    fase: terminado ? "fin" : "jugando",
  };
}

export function juegoReducer(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "reiniciar":
      return estadoInicial(accion.cartas);
    case "voltear":
      return voltear(estado, accion.id);
    case "resolver":
      return estado.volteadas.length === 2 ? { ...estado, volteadas: [] } : estado;
    case "tic":
      return estado.fase === "jugando" ? { ...estado, segundos: estado.segundos + 1 } : estado;
    default:
      return estado;
  }
}
