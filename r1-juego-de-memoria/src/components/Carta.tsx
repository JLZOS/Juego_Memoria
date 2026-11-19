import type { Carta as DatosCarta } from "@/lib/juegoReducer";
import styles from "./Carta.module.css";

type Props = {
  carta: DatosCarta;
  posicion: number;
  volteada: boolean;
  alVoltear: (id: number) => void;
};

export function Carta({ carta, posicion, volteada, alVoltear }: Props) {
  const { id, simbolo, descubierta } = carta;
  const visible = volteada || descubierta;
  const etiqueta = visible
    ? `Carta ${posicion}, ${simbolo}${descubierta ? ", pareja encontrada" : ""}`
    : `Carta ${posicion}, boca abajo`;
  const clases = [styles.carta, visible && styles.visible, descubierta && styles.descubierta]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={clases}
      aria-pressed={visible}
      aria-label={etiqueta}
      aria-disabled={descubierta || undefined}
      onClick={() => {
        if (!descubierta) alVoltear(id);
      }}
    >
      <span className={styles.interior} aria-hidden="true">
        <span className={styles.reverso}>?</span>
        <span className={styles.frente}>
          {visible && simbolo}
          {descubierta && <span className={styles.marca}>✓</span>}
        </span>
      </span>
    </button>
  );
}
