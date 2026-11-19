import { duracionISO, formatearTiempo } from "@/lib/formato";
import styles from "./Marcador.module.css";

type Props = {
  movimientos: number;
  segundos: number;
  parejasEncontradas: number;
  totalParejas: number;
};

export function Marcador({ movimientos, segundos, parejasEncontradas, totalParejas }: Props) {
  return (
    <dl className={styles.marcador}>
      <div>
        <dt>Movimientos</dt>
        <dd>{movimientos}</dd>
      </div>
      <div>
        <dt>Tiempo</dt>
        <dd>
          <time dateTime={duracionISO(segundos)}>{formatearTiempo(segundos)}</time>
        </dd>
      </div>
      <div>
        <dt>Parejas</dt>
        <dd>
          {parejasEncontradas} / {totalParejas}
        </dd>
      </div>
    </dl>
  );
}
