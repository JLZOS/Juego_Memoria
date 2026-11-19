import { useId } from "react";
import type { ConfigJuego } from "@/hooks/useJuego";
import { IDS_TEMA, TAMANOS, TEMAS, esIdTema, parejasDe } from "@/lib/temas";
import styles from "./Configuracion.module.css";

type Props = {
  configuracion: ConfigJuego;
  alCambiar: (nueva: ConfigJuego) => void;
};

export function Configuracion({ configuracion, alCambiar }: Props) {
  const idTitulo = useId();
  const idTema = useId();

  return (
    <section className={styles.configuracion} aria-labelledby={idTitulo}>
      <h2 id={idTitulo}>Configuración</h2>
      <div className={styles.campos}>
        <fieldset className={styles.grupo}>
          <legend>Tamaño del tablero</legend>
          {TAMANOS.map((tamano) => (
            <label key={tamano} className={styles.opcion}>
              <input
                type="radio"
                name="tamano"
                value={tamano}
                checked={configuracion.tamano === tamano}
                onChange={() => alCambiar({ ...configuracion, tamano })}
              />
              {`${tamano} cartas (${parejasDe(tamano)} parejas)`}
            </label>
          ))}
        </fieldset>
        <div className={styles.grupo}>
          <label htmlFor={idTema} className={styles.etiqueta}>
            Tema
          </label>
          <select
            id={idTema}
            className={styles.selector}
            value={configuracion.tema}
            onChange={(evento) => {
              const tema = evento.target.value;
              if (esIdTema(tema)) alCambiar({ ...configuracion, tema });
            }}
          >
            {IDS_TEMA.map((id) => (
              <option key={id} value={id}>
                {TEMAS[id].nombre} {TEMAS[id].simbolos[0]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
