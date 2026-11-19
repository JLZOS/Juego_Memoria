import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <>
      <h1>Página no encontrada</h1>
      <p className="introduccion">La dirección que buscas no existe o cambió de lugar.</p>
      <Link href="/" className="boton">
        Volver al juego
      </Link>
    </>
  );
}
