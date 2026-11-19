import type { Metadata } from "next";
import { ListaRecords } from "@/components/ListaRecords";

export const metadata: Metadata = {
  title: "Récords",
  description: "Los mejores resultados del juego de memoria para cada tamaño de tablero.",
};

export default function PaginaRecords() {
  return (
    <>
      <h1>Récords</h1>
      <p className="introduccion">
        Gana el resultado con menos movimientos; si hay empate, el más rápido. Los récords se
        guardan solo en este navegador.
      </p>
      <ListaRecords />
    </>
  );
}
