import { useSyncExternalStore } from "react";

function suscribir(alCambiar: () => void) {
  document.addEventListener("visibilitychange", alCambiar);
  return () => document.removeEventListener("visibilitychange", alCambiar);
}

/** true mientras la pestaña está oculta (Page Visibility API). */
export function usePestanaOculta() {
  return useSyncExternalStore(
    suscribir,
    () => document.hidden,
    () => false,
  );
}
