import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Navegacion } from "@/components/Navegacion";
import { config } from "@/lib/config";
import "./globals.css";

const geist = Geist({ variable: "--fuente-sans", subsets: ["latin"] });

const descripcion =
  "Juego de memoria de parejas accesible: elige tamaño y tema, encuentra todas las parejas y supera tus récords.";

export const metadata: Metadata = {
  metadataBase: new URL(config.urlSitio),
  title: { default: "Juego de memoria (parejas)", template: "%s · Juego de memoria" },
  description: descripcion,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Juego de memoria",
    title: "Juego de memoria (parejas)",
    description: descripcion,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#14141f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={geist.variable}>
      <body>
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <header className="cabecera">
          <div className="contenedor cabecera__interior">
            <Link href="/" className="cabecera__marca">
              <span aria-hidden="true">🧠</span> Memoria
            </Link>
            <Navegacion />
          </div>
        </header>
        <main id="contenido" tabIndex={-1} className="contenedor principal">
          {children}
        </main>
        <footer className="pie">
          <div className="contenedor">
            <p>Taller R1 · Juego de memoria hecho con Next.js y React.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
