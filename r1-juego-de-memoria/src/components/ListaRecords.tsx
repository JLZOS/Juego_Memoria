"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRecords } from "@/hooks/useRecords";
import { describirTiempo, duracionISO, formatearFecha, formatearTiempo } from "@/lib/formato";
import { borrarRecords } from "@/lib/records";
import { TAMANOS, parejasDe } from "@/lib/temas";
import { Confirmacion } from "./Confirmacion";
import styles from "./ListaRecords.module.css";

export function ListaRecords() {
  const records = useRecords();
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);

  const hayRecords = records !== null && TAMANOS.some((tamano) => records[tamano]);

  function borrar() {
    flushSync(() => {
      setConfirmando(false);
      setMensaje(borrarRecords() ? "Récords borrados." : "No fue posible borrar los récords.");
    });
    titulo.current?.focus();
  }

  return (
    <section className={styles.records} aria-labelledby={idTitulo}>
      <h2 id={idTitulo} ref={titulo} tabIndex={-1}>
        Mejores resultados
      </h2>
      <p className={styles.mensaje} aria-live="polite">
        {mensaje}
      </p>

      {records === null ? (
        <p>Cargando récords…</p>
      ) : !hayRecords ? (
        <div className={styles.vacio}>
          <p>Aún no hay récords.</p>
          <Link href="/" className="boton">
            Jugar una partida
          </Link>
        </div>
      ) : (
        <>
          <table className={styles.tabla}>
            <caption>Mejor resultado por tamaño de tablero</caption>
            <thead>
              <tr>
                <th scope="col">Tablero</th>
                <th scope="col">Movimientos</th>
                <th scope="col">Tiempo</th>
                <th scope="col">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {TAMANOS.map((tamano) => {
                const record = records[tamano];
                return (
                  <tr key={tamano}>
                    <th scope="row">
                      {tamano} cartas
                      <span className="solo-lectores"> ({parejasDe(tamano)} parejas)</span>
                    </th>
                    {record ? (
                      <>
                        <td>{record.movimientos}</td>
                        <td>
                          <time
                            dateTime={duracionISO(record.segundos)}
                            title={describirTiempo(record.segundos)}
                          >
                            {formatearTiempo(record.segundos)}
                          </time>
                        </td>
                        <td>
                          <time dateTime={record.fecha}>{formatearFecha(record.fecha)}</time>
                        </td>
                      </>
                    ) : (
                      <td colSpan={3}>Sin récord</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            type="button"
            className="boton boton--peligro"
            onClick={() => setConfirmando(true)}
          >
            Borrar récords
          </button>
        </>
      )}

      <Confirmacion
        abierto={confirmando}
        titulo="¿Borrar todos los récords?"
        mensaje="Se eliminarán los mejores resultados de todos los tamaños. Esta acción no se puede deshacer."
        textoConfirmar="Sí, borrar"
        alConfirmar={borrar}
        alCancelar={() => setConfirmando(false)}
      />
    </section>
  );
}
