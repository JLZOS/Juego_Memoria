# R1 · Juego de memoria (parejas)

Juego de parejas hecho con Next.js (App Router), React y TypeScript. Todo ocurre en el navegador: sin base de datos ni API externa.

**Dirección desplegada:** _pendiente (agregue aquí la URL de Vercel)_

## Requisitos

- Node.js LTS (probado con Node 24) y Git.

## Instalar y ejecutar

```bash
npm install
cp .env.example .env.local   # opcional: todas las variables tienen valor por defecto
npm run dev                  # http://localhost:3000
```

## Comprobar

| Comando                 | Qué hace                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `npm test`              | Pruebas con Vitest y React Testing Library                           |
| `npm run test:coverage` | Pruebas con cobertura (umbral 80 % en `src/lib` y `src/hooks`)       |
| `npm run check`         | Tipos + ESLint sin advertencias + Prettier + pruebas con cobertura   |
| `npm run build`         | Build de producción (verifica que las páginas se prerendericen bien) |
| `npm run format`        | Aplica Prettier                                                      |

## Variables de entorno

Vea `.env.example`. Ninguna es obligatoria.

| Variable                            | Por defecto             | Uso                                         |
| ----------------------------------- | ----------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_TIEMPO_COMPARACION_MS` | `800`                   | Tiempo que se muestran dos cartas distintas |
| `NEXT_PUBLIC_CLAVE_RECORDS`         | `r1-memoria:records`    | Clave de `localStorage` para los récords    |
| `NEXT_PUBLIC_SITE_URL`              | `http://localhost:3000` | URL base para metadatos, robots y sitemap   |

## Estructura

```
src/
  app/          páginas (/ y /records), layout, 404, robots y sitemap
  components/   presentación: Carta, Tablero, Juego, Configuracion, Marcador, Victoria, ListaRecords…
  hooks/        useJuego (reductor + temporizadores), usePestanaOculta, useRecords
  lib/          lógica pura: memoria (barajar, crearCartas), juegoReducer, records, temas, formato, config
tests/          pruebas de lógica e interfaz
```

- **Lógica de negocio** (`src/lib`): funciones puras sin React; `juegoReducer` nunca modifica el estado recibido.
- **Acceso a datos** (`src/lib/records.ts`): todo `localStorage` va dentro de `try/catch` y los datos se validan antes de usarse.
- **Presentación** (`src/components`, `src/app`): solo renderiza y despacha acciones a través de `useJuego`.

## Reglas del juego

- Tamaños: 12, 16 o 24 cartas. Temas: animales, comida y deportes (12 emojis distintos cada uno).
- Barajado con Fisher–Yates. Se voltea con clic, Enter o Espacio.
- Dos iguales quedan descubiertas; dos distintas se ocultan a los ~800 ms y mientras tanto no se puede voltear otra.
- Un movimiento = dos cartas. El cronómetro empieza con la primera carta y se pausa si la pestaña está oculta.
- Récord por tamaño: menos movimientos; si empatan, menos tiempo.
