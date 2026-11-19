import { Juego } from "@/components/Juego";

export default function Inicio() {
  return (
    <>
      <h1>Juego de memoria</h1>
      <p className="introduccion">
        Voltea dos cartas por turno con un clic o con Enter o Espacio y encuentra todas las parejas
        con el menor número de movimientos.
      </p>
      <Juego />
    </>
  );
}
