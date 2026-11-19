"use client";

import { useId, useState } from "react";
import { useJuego, type ConfigJuego } from "@/hooks/useJuego";
import { Configuracion } from "./Configuracion";
import { Confirmacion } from "./Confirmacion";
import { Marcador } from "./Marcador";
import { Tablero } from "./Tablero";
import { Victoria } from "./Victoria";
import styles from "./Juego.module.css";

const CONFIG_INICIAL: ConfigJuego = { tamano: 12, tema: "animales" };

export function Juego() {
  const {
    estado,
    configuracion,
    anuncio,
    guardado,
    parejasEncontradas,
    totalParejas,
    voltear,
    reiniciar,
  } = useJuego(CONFIG_INICIAL);
  const [pendiente, setPendiente] = useState<ConfigJuego | null>(null);
  const idTablero = useId();
  const { cartas, volteadas, movimientos, segundos, fase } = estado;

  function cambiarConfiguracion(nueva: ConfigJuego) {
    if (fase === "jugando") setPendiente(nueva);
    else reiniciar(nueva);
  }

  return (
    <div className={styles.juego}>
      <div className={styles.panel}>
        <Configuracion configuracion={configuracion} alCambiar={cambiarConfiguracion} />
        <Marcador
          movimientos={movimientos}
          segundos={segundos}
          parejasEncontradas={parejasEncontradas}
          totalParejas={totalParejas}
        />
        <button type="button" className="boton" onClick={() => reiniciar()}>
          Reiniciar
        </button>
      </div>

      <section className={styles.zona} aria-labelledby={idTablero}>
        <h2 id={idTablero} className="solo-lectores">
          Tablero
        </h2>
        <p className={styles.estado} aria-live="polite" aria-atomic="true">
          {anuncio || "Elige una carta para empezar."}
        </p>
        {fase === "fin" && (
          <Victoria
            tamano={cartas.length}
            movimientos={movimientos}
            segundos={segundos}
            guardado={guardado}
            alJugarOtraVez={() => reiniciar()}
          />
        )}
        <Tablero cartas={cartas} volteadas={volteadas} alVoltear={voltear} />
      </section>

      <Confirmacion
        abierto={pendiente !== null}
        titulo="¿Empezar una partida nueva?"
        mensaje="Cambiar el tamaño o el tema reinicia la partida en curso y se pierde el progreso."
        textoConfirmar="Sí, reiniciar"
        alConfirmar={() => {
          if (pendiente) reiniciar(pendiente);
          setPendiente(null);
        }}
        alCancelar={() => setPendiente(null)}
      />
    </div>
  );
}
