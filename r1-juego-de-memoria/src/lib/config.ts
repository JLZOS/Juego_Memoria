export function leerEntero(
  valor: string | undefined,
  porDefecto: number,
  min: number,
  max: number,
) {
  const numero = Number(valor);
  if (valor === undefined || valor.trim() === "" || !Number.isInteger(numero)) return porDefecto;
  return Math.min(max, Math.max(min, numero));
}

// Next.js solo sustituye las variables NEXT_PUBLIC_* escritas literalmente como process.env.NOMBRE.
export const config = {
  tiempoComparacionMs: leerEntero(process.env.NEXT_PUBLIC_TIEMPO_COMPARACION_MS, 800, 100, 5000),
  claveRecords: process.env.NEXT_PUBLIC_CLAVE_RECORDS?.trim() || "r1-memoria:records",
  urlSitio: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
} as const;
