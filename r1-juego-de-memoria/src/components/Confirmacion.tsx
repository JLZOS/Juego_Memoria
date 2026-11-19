"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./Confirmacion.module.css";

type Props = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  alConfirmar: () => void;
  alCancelar: () => void;
};

export function Confirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  alConfirmar,
  alCancelar,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idMensaje = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    // jsdom no implementa showModal/close: se usa el atributo open como respaldo.
    if (abierto && !dialogo.open) {
      if (typeof dialogo.showModal === "function") dialogo.showModal();
      else dialogo.setAttribute("open", "");
    } else if (!abierto && dialogo.open) {
      if (typeof dialogo.close === "function") dialogo.close();
      else dialogo.removeAttribute("open");
    }
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby={idTitulo}
      aria-describedby={idMensaje}
      onCancel={(evento) => {
        evento.preventDefault();
        alCancelar();
      }}
    >
      <h2 id={idTitulo}>{titulo}</h2>
      <p id={idMensaje}>{mensaje}</p>
      <div className={styles.acciones}>
        <button type="button" className="boton boton--secundario" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="button" className="boton" onClick={alConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}
