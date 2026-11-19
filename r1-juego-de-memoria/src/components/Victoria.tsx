import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { describirTiempo, duracionISO } from "@/lib/formato";
import type { ResultadoGuardado } from "@/lib/records";
import styles from "./Victoria.module.css";

type Props = {
  tamano: number;
  movimientos: number;
  segundos: number;
  guardado: ResultadoGuardado | null;
  alJugarOtraVez: () => void;
};

export function Victoria({ tamano, movimientos, segundos, guardado, alJugarOtraVez }: Props) {
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titulo.current?.focus();
  }, []);

  return (
    <section className={styles.victoria} aria-labelledby={idTitulo}>
      <h2 id={idTitulo} ref={titulo} tabIndex={-1}>
        🎉 ¡Ganaste!
      </h2>
      <p>
        Completaste el tablero de {tamano} cartas en <strong>{movimientos} movimientos</strong> y{" "}
        <strong>
          <time dateTime={duracionISO(segundos)}>{describirTiempo(segundos)}</time>
        </strong>
        .
      </p>
      {guardado === "nuevo" && <p>🏆 ¡Nuevo récord para {tamano} cartas!</p>}
      {guardado === "error" && (
        <p>No fue posible guardar el récord: el almacenamiento del navegador no está disponible.</p>
      )}
      <div className={styles.acciones}>
        <button type="button" className="boton" onClick={alJugarOtraVez}>
          Jugar otra vez
        </button>
        <Link href="/records" className="boton boton--secundario">
          Ver récords
        </Link>
      </div>
    </section>
  );
}
