/** 65 → "1:05" */
export function formatearTiempo(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** 65 → "1 minuto y 5 segundos" (para lectores de pantalla) */
export function describirTiempo(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  const minutos = Math.floor(s / 60);
  const resto = s % 60;
  const textoSegundos = `${resto} ${resto === 1 ? "segundo" : "segundos"}`;
  if (minutos === 0) return textoSegundos;
  const textoMinutos = `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  return resto === 0 ? textoMinutos : `${textoMinutos} y ${textoSegundos}`;
}

/** 65 → "PT1M5S" (atributo dateTime de <time>) */
export function duracionISO(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  return `PT${Math.floor(s / 60)}M${s % 60}S`;
}

const formatoFecha = new Intl.DateTimeFormat("es", { dateStyle: "medium" });

export function formatearFecha(iso: string) {
  return formatoFecha.format(new Date(iso));
}
