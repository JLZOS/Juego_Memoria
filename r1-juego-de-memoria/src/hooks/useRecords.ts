import { useMemo, useSyncExternalStore } from "react";
import { leerTextoRecords, parsearRecords, suscribirRecords, type Records } from "@/lib/records";

/** Récords guardados, o null mientras no se ha podido leer el navegador (render del servidor). */
export function useRecords(): Records | null {
  const texto = useSyncExternalStore<string | null | undefined>(
    suscribirRecords,
    leerTextoRecords,
    () => undefined,
  );
  return useMemo(() => (texto === undefined ? null : parsearRecords(texto)), [texto]);
}
