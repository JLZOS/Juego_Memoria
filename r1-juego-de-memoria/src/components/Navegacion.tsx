"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navegacion.module.css";

const ENLACES = [
  { href: "/", texto: "Jugar" },
  { href: "/records", texto: "Récords" },
] as const;

export function Navegacion() {
  const ruta = usePathname();
  return (
    <nav aria-label="Principal">
      <ul className={styles.lista}>
        {ENLACES.map(({ href, texto }) => (
          <li key={href}>
            <Link
              href={href}
              className={styles.enlace}
              aria-current={ruta === href ? "page" : undefined}
            >
              {texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
