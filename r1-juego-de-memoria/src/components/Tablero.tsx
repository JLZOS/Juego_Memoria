import type { Carta as DatosCarta } from "@/lib/juegoReducer";
import { Carta } from "./Carta";
import styles from "./Tablero.module.css";

type Props = {
  cartas: DatosCarta[];
  volteadas: number[];
  alVoltear: (id: number) => void;
};

export function Tablero({ cartas, volteadas, alVoltear }: Props) {
  return (
    <ul className={styles.tablero} aria-label={`Tablero de ${cartas.length} cartas`}>
      {cartas.map((carta, indice) => (
        <li key={carta.id}>
          <Carta
            carta={carta}
            posicion={indice + 1}
            volteada={volteadas.includes(carta.id)}
            alVoltear={alVoltear}
          />
        </li>
      ))}
    </ul>
  );
}
