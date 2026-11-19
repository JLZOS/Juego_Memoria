# Taller de recuperación R1 · Juego de memoria (parejas)

> **Individual.** Este documento es lo único que necesita: trae el problema, el paso a paso, los criterios de aceptación y la forma de entrega. No se entrega código base.

**En una frase:** un juego de parejas hecho con React donde usted demuestra que domina el **estado, los eventos, los hooks y la accesibilidad**.

---

## 1. Qué se evalúa

Este taller recupera lo visto antes del parcial (unidades 1 y 2 del curso). Para aprobarlo debe demostrar que puede:

| Competencia | Cómo se ve en este taller |
|---|---|
| HTML semántico, CSS responsivo y accesibilidad | Tablero con botones reales, foco visible, anuncios con `aria-live`, tres anchos de pantalla |
| JavaScript moderno | Funciones puras, desestructuración, métodos de arreglos, inmutabilidad |
| DOM, eventos y estado | Clics y teclado sobre las cartas, bloqueo de entradas mientras se comparan dos cartas |
| React | Componentes con props, `useReducer`, `useEffect` con limpieza, un hook propio |
| Rutas y almacenamiento | Dos páginas con el App Router y récords guardados en `localStorage` |
| Pruebas | Vitest para la lógica y React Testing Library para la interfaz |
| Calidad y despliegue | Core Web Vitals, Lighthouse, responsive, WCAG 2.2 AA, retos de excelencia y evidencias en `calidad/` (sección 10); despliegue en Vercel |
| Uso responsable de la IA | Configuración propia en el primer commit, pruebas de contención y bitácora en `ia/` (sección 11) |

No hay base de datos, ni Firebase, ni API externa: todo ocurre en el navegador.

## 2. Reglas del taller

1. El trabajo es **individual**. Puede usar un asistente de IA, pero debe llevar una **bitácora** (`ia/BITACORA.md`, sección 11) y entender cada línea que entregue.
2. Historial de Git propio, con al menos **8 commits** que cuenten la historia del trabajo (no un solo commit al final). El **primer commit** contiene la configuración de IA (sección 11).
3. Al entregar habrá una **sustentación de unos 10 minutos**: se le pedirá cambiar algo del juego en vivo (por ejemplo, agregar un nivel nuevo o cambiar la regla de puntaje). Quien no pueda explicar su código no aprueba el taller, aunque el juego funcione.
4. Puede agregar mejoras, pero primero deben cumplirse todos los requisitos y criterios de aceptación.

## 3. Preparación (paso a paso)

1. Compruebe que tiene Node.js (versión LTS) y Git:

   ```bash
   node --version
   git --version
   ```

   ✔ Ambos comandos muestran un número de versión.

2. Cree el proyecto (responda que **sí** a TypeScript, ESLint y App Router, y que **no** a Tailwind si prefiere escribir su propio CSS):

   ```bash
   npx create-next-app@latest r1-juego-de-memoria --ts --app --eslint --src-dir
   cd r1-juego-de-memoria
   ```

3. Instale las herramientas de pruebas:

   ```bash
   npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
   ```

4. Cree un archivo `vitest.config.ts` en la raíz con este contenido:

   ```ts
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"], globals: true },
   });
   ```

5. Cree `tests/setup.ts` con una sola línea:

   ```ts
   import "@testing-library/jest-dom/vitest";
   ```

6. En `package.json`, dentro de `"scripts"`, agregue `"test": "vitest run"`.

   ✔ `npm run dev` abre la página de ejemplo en `http://localhost:3000`.

7. Cree el repositorio en GitHub. **Antes de pedirle nada a la IA**, construya su configuración de IA (sección 11) y haga con ella el **primer commit**.

## 4. Qué debe construir

### 4.1 Páginas

| Ruta | Contenido |
|---|---|
| `/` | El juego: configuración (tamaño y tema), tablero, contador de movimientos, cronómetro y botón de reiniciar |
| `/records` | Los mejores resultados guardados, por tamaño de tablero |

Ambas páginas comparten un `layout.tsx` con `<header>`, `<nav>` (enlaces a las dos páginas), `<main>` y `<footer>`, y con `lang="es"`.

### 4.2 Requisitos funcionales

- **RF-01** El jugador elige el tamaño: **12 cartas** (6 parejas), **16** (8 parejas) o **24** (12 parejas).
- **RF-02** El jugador elige el tema: tres juegos de símbolos de al menos 12 emojis cada uno (por ejemplo animales, comida y deportes).
- **RF-03** Al iniciar, las cartas se **barajan con el algoritmo de Fisher–Yates**. No use `sort(() => Math.random() - 0.5)`: no baraja de forma uniforme.
- **RF-04** Una carta se voltea con clic o con las teclas Enter y Espacio. Al voltear dos cartas:
  - si son iguales, quedan descubiertas para siempre;
  - si son distintas, se muestran unos 800 ms y se vuelven a ocultar.
- **RF-05** Mientras se comparan dos cartas, las demás no responden (no se puede voltear una tercera).
- **RF-06** Se cuentan los **movimientos** (un movimiento = dos cartas volteadas) y el **tiempo**. El cronómetro empieza con la primera carta, se detiene al terminar y **se pausa si la pestaña queda oculta** (Page Visibility API).
- **RF-07** Al descubrir todas las parejas aparece un mensaje de victoria con los movimientos y el tiempo, y el resultado se guarda si mejora el récord de ese tamaño (menos movimientos; si empatan, menos tiempo).
- **RF-08** `/records` lista el mejor resultado de cada tamaño y permite borrar los récords con una confirmación.

### 4.3 Estado con `useReducer`

Toda la lógica del juego va en una **función reductora pura** (`juegoReducer`) en un archivo aparte, sin importar React:

```ts
type Carta = { id: number; simbolo: string; descubierta: boolean };

type Estado = {
  cartas: Carta[];
  volteadas: number[];        // ids de las cartas boca arriba que aún no se resolvieron (0, 1 o 2)
  movimientos: number;
  segundos: number;
  fase: "inicio" | "jugando" | "fin";
};

type Accion =
  | { tipo: "reiniciar"; cartas: Carta[] }
  | { tipo: "voltear"; id: number }
  | { tipo: "resolver" }      // se despacha ~800 ms después de la segunda carta
  | { tipo: "tic" };          // un segundo más
```

Reglas del reductor: **nunca modifica** el estado recibido (devuelve objetos y arreglos nuevos), ignora `voltear` si la carta ya está descubierta, ya está volteada o ya hay dos volteadas, y pasa a `fin` cuando todas están descubiertas.

## 5. Paso a paso sugerido

Haga un commit al terminar cada paso.

1. **Lógica pura primero** (`src/lib/memoria.ts`): escriba `barajar(arreglo)` con Fisher–Yates (copie el arreglo, recorra de atrás hacia adelante e intercambie cada posición con una aleatoria entre 0 y la actual) y `crearCartas(simbolos, parejas)`, que toma las parejas necesarias, las duplica y las baraja.
   ✔ Con 6 parejas devuelve 12 cartas y cada símbolo aparece exactamente 2 veces.
2. **El reductor** (`src/lib/juegoReducer.ts`) con las cuatro acciones de la sección 4.3. Escriba las pruebas de la sección 8 mientras lo hace.
   ✔ Las pruebas del reductor pasan sin abrir el navegador.
3. **Componente `Carta`**: un `<button type="button">` con `aria-pressed`, un `aria-label` («Carta 3, boca abajo» / «Carta 3, 🐶») y un contenido que cambia según su estado. Si está descubierta, use `disabled` o `aria-disabled`.
4. **Componente `Tablero`**: cuadrícula con CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(72px, 1fr))`). Los botones deben medir al menos 44×44 px.
5. **Hook propio `useJuego`** (`src/hooks/useJuego.ts`): usa `useReducer`, despacha `resolver` con `setTimeout` cuando hay dos volteadas y **cancela el temporizador en la limpieza del efecto**; despacha `tic` cada segundo con `setInterval` solo cuando `fase === "jugando"` y también lo limpia.
   ✔ Al reiniciar o cambiar de página no quedan temporizadores vivos (compruébelo con un `console.log` temporal en la limpieza).
6. **Pausa por visibilidad**: escuche `visibilitychange` (puede usar `useSyncExternalStore`) y no despache `tic` mientras `document.hidden` sea verdadero.
7. **Récords**: funciones `leerRecords()` y `guardarRecord(tamano, resultado)` en `src/lib/records.ts`. Todo acceso a `localStorage` va dentro de `try/catch` (puede estar bloqueado o lleno) y los datos leídos se validan antes de usarse. La página sigue funcionando si el almacenamiento falla.
8. **Interfaz y accesibilidad**: región `aria-live="polite"` que anuncia «Pareja encontrada», «Las cartas no coinciden» y la victoria (no anuncie cada segundo del cronómetro). Respete `prefers-reduced-motion` (sin animación de giro) y `prefers-color-scheme`.
9. **Página `/records`** y navegación.
10. **Pruebas de interfaz** (sección 8), revisión final con la lista de la sección 7 y bitácora.

## 6. Reglas de validación y casos límite

- Los símbolos de un tema no se repiten.
- Al cambiar de tamaño o tema durante una partida se pide confirmación o se reinicia el juego de forma clara.
- Si los datos de `localStorage` están dañados (otro formato, JSON roto), se ignoran y se muestra «Aún no hay récords».
- Un clic doble rápido sobre la misma carta **no** cuenta como segunda carta.

## 7. Interfaz, accesibilidad y diseño responsivo

- **HTML semántico:** `<header>`, `<nav>`, `<main>`, `<footer>`, un solo `<h1>` por página, títulos sin saltos, `<label>` en cada control de configuración (use `<select>` o `<fieldset>` con botones de opción).
- **Teclado:** se puede jugar entero sin ratón (Tab entre cartas y Enter/Espacio para voltear); el foco siempre es visible; hay un enlace «Saltar al contenido».
- **Contraste:** mínimo 4,5:1 en texto y 3:1 en bordes y controles. No dependa solo del color para mostrar una pareja encontrada (agregue un icono o un texto).
- **Responsivo:** pruebe en **360, 768 y 1024 px** y con zoom al 200 %, sin desplazamiento horizontal. En 360 px el tablero de 24 cartas debe verse completo desplazándose solo en vertical.
- **Estados:** si no hay récords, muestre un estado vacío con un enlace para jugar.
- **Metas medibles:** Core Web Vitals, Lighthouse, responsive y accesibilidad tienen cifras concretas en la **sección 10**.

## 8. Criterios de aceptación y pruebas mínimas

**Criterios** (se revisan en vivo):

1. Dado un tablero de 12 cartas, cuando volteo dos iguales, quedan descubiertas y el contador sube 1.
2. Dadas dos cartas distintas, vuelven a ocultarse sin que yo haga nada y mientras tanto no puedo voltear otra.
3. Dada la pestaña oculta durante 10 segundos, el cronómetro no avanza.
4. Dada una partida terminada con mejor resultado, `/records` lo muestra tras recargar la página.
5. Dado un lector de pantalla, se anuncia cada resultado de comparación y la victoria.
6. Dado `localStorage` lleno o bloqueado, el juego funciona y no aparece ningún error en la consola.

**Pruebas con Vitest** (`npm test`; al menos las siguientes):

- `barajar` no modifica el arreglo original, conserva todos los elementos y no pierde ninguno.
- `crearCartas(…, 8)` devuelve 16 cartas con cada símbolo exactamente dos veces.
- Reductor: voltear dos cartas iguales las deja descubiertas; voltear dos distintas y despachar `resolver` las oculta; una tercera carta se ignora; al descubrir todas la fase es `fin`.
- Reductor: el estado anterior no se modificó (compare con una copia hecha antes con `structuredClone`).
- React Testing Library: al hacer clic en una carta cambia su `aria-label`; al terminar la partida aparece el mensaje de victoria (use `vi.useFakeTimers()` para avanzar los 800 ms).
- React Testing Library: la página `/records` muestra el estado vacío cuando no hay datos.

Busque los elementos por rol y etiqueta (como lo haría un usuario), no por clases de CSS.

Además, `npm run check` (tipos, ESLint sin advertencias, Prettier y pruebas) debe pasar y la **cobertura de la lógica de negocio** debe ser de 80 % o más (sección 11).

## 9. Despliegue y entrega

### 9.1 Despliegue en Vercel (paso a paso)

Las metas de calidad (sección 10) se miden sobre la **dirección de producción**, por eso el taller se despliega. No necesita variables de entorno ni cuentas de otros servicios.

1. Suba el repositorio a GitHub **usted mismo** (`git push`; no se lo pida a la IA).
2. Entre a [vercel.com](https://vercel.com), inicie sesión con GitHub y elija **Add New… → Project**.
3. Importe el repositorio `r1-juego-de-memoria`. Vercel detecta Next.js solo; deje la configuración por defecto y pulse **Deploy**.
4. ✔ Al terminar, abra la dirección `https://….vercel.app` y recorra todas las páginas. Cada `git push` a la rama principal vuelve a desplegar.
5. Mida Lighthouse y PageSpeed Insights **sobre esa dirección**, no sobre `localhost`.

### 9.2 Qué se entrega

- Repositorio de GitHub con historial de commits propio, con la **configuración de IA en el primer commit**.
- La **dirección desplegada** en el `README`, junto con las instrucciones para instalar, ejecutar (`npm run dev`), comprobar (`npm run check`) y probar (`npm test`).
- Carpeta **`calidad/`** y archivo **`CALIDAD.md`** con las evidencias de la sección 10 (informes de Lighthouse, capturas en 360/768/1024 px, axe, validador HTML, tabla LCP/INP/CLS, resultado de `npm run check`, retos elegidos).
- Carpeta **`ia/`** con las pruebas de contención de la configuración de IA y la bitácora `ia/BITACORA.md` (sección 11).
- Estar listo para **modificar el taller en vivo** en la sustentación.

**Lista de verificación final:**

- [ ] La dirección de Vercel abre y todas las páginas funcionan.
- [ ] `npm run check` pasa y la cobertura de la lógica de negocio es de 80 % o más.
- [ ] Ningún secreto en Git (aunque este taller no use claves: la configuración de IA debe impedir que la IA las lea).
- [ ] La configuración de IA está en el primer commit y las pruebas de contención están en `ia/`.
- [ ] `calidad/` y `CALIDAD.md` completos; al menos 3 retos de excelencia con evidencia.
- [ ] `ia/BITACORA.md` con al menos 3 casos en que rechazó o corrigió a la IA.

## 10. Metas de calidad y retos de excelencia

El taller es pequeño para que haya tiempo de hacerlo **bien**: la meta no es solo que funcione, sino que se vea, se sienta y se mida como un producto profesional. Estas metas valen para **todos** los talleres de recuperación y son las mismas que se exigen en los proyectos finales.

### 1 · Rendimiento y Core Web Vitals

_Se miden en la URL de producción (Vercel), perfil móvil._

- **LCP ≤ 2,5 s** (carga del contenido principal).
- **INP ≤ 200 ms** (respuesta a cada interacción).
- **CLS ≤ 0,1** (sin saltos de diseño).
- Se evalúan al percentil 75. De apoyo (orientativo): FCP ≤ 1,8 s, TTFB ≤ 0,8 s, TBT ≤ 200 ms.
- **Lighthouse móvil:** Rendimiento ≥ 90 · Accesibilidad ≥ 95 · Buenas prácticas ≥ 95 · SEO ≥ 95.
- Presupuesto: JavaScript transferido ≤ 200 kB y página inicial ≤ 1 MB (DevTools → Red, sin caché).
- **Cómo medir:** Lighthouse, PageSpeed Insights y `useReportWebVitals` (`next/web-vitals`). Lighthouse **no mide INP** en laboratorio (usa TBT como aproximación): mídalo interactuando con la página y con las métricas reales.

### 2 · Responsive: 360 · 768 · 1024 px

_Diseño mobile-first, probado en los tres anchos._

- **360 px (móvil):** una columna, sin scroll horizontal, objetivos táctiles ≥ 44×44 px (mínimo WCAG 24×24), texto ≥ 16 px, menú colapsable accesible por teclado.
- **768 px (tableta):** dos columnas donde tenga sentido, navegación visible o menú con el foco bien gestionado, formularios en dos columnas.
- **1024 px (escritorio):** hasta tres columnas, líneas de texto de ≤ 70 caracteres (`max-width: 70ch`), navegación completa.
- En los tres: sin recortes ni solapes, imágenes con `sizes` (`next/image`), `rem`, `clamp()`, Grid y Flexbox, **sin anchos fijos en píxeles**.
- Zoom al 200 % sin perder contenido ni funciones; **reflow** sin scroll horizontal a 320 px (WCAG 1.4.10).
- Vertical y horizontal. Probar en DevTools (modo dispositivo) **y en un teléfono real**.

### 3 · Accesibilidad (WCAG 2.2 nivel AA)

_Lo automático detecta solo una parte: también se revisa a mano._

- Todo se usa **solo con teclado**, en orden lógico y sin trampas; enlace **«Saltar al contenido»**.
- **Foco visible** (nunca `outline: none` sin sustituto) y no tapado por cabeceras fijas (2.4.11).
- Contraste ≥ **4,5:1** en texto y ≥ **3:1** en controles y gráficos (1.4.3, 1.4.11). No usar solo el color para informar.
- Objetivos táctiles ≥ 24×24 px (2.5.8).
- Formularios: `<label>`, errores en texto junto al campo y anunciados (`aria-describedby`, `aria-live`), `autocomplete` (1.3.5) y sin pedir lo ya escrito (3.3.7).
- `alt` útil en imágenes (vacío si es decorativa), `lang="es"`, `<title>` único por ruta; cambios de estado y de ruta anunciados a lectores de pantalla.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme`.
- **Verificar con:** Lighthouse + axe DevTools, recorrido solo con teclado y **una pasada con lector de pantalla** (NVDA en Windows o VoiceOver).

### 4 · HTML semántico y buenas prácticas

_Hacer bien lo básico antes de agregar funciones._

- Landmarks `<header>`, `<nav>`, `<main>`, `<footer>`; **un solo `<h1>`** y títulos sin saltar niveles.
- El elemento correcto: `<button>` para acciones y `<a>` para navegar; `<ul>`/`<ol>` para listas; `<table>` solo para datos; `<time>`, `<figure>`, `<dialog>`, `<details>`.
- **Cero `<div onClick>`**: nada interactivo sin elemento nativo; ARIA solo cuando no exista el nativo.
- Sin errores en el validador HTML del W3C ni en la consola; ESLint sin advertencias (reglas `jsx-a11y` de Next.js).
- CSS mobile-first, con variables, sin `!important` innecesario y con una convención consistente (módulos CSS o BEM).
- `next/image` con `width` y `height` (evita CLS) y `next/font` para tipografías; carga diferida de lo que no se ve.
- SEO básico: `<title>`, `description`, Open Graph, `robots`, `sitemap`, página 404 propia y favicon.
- HTTPS, sin contenido mixto y con cabeceras de seguridad.

### 5 · Retos de excelencia

_Elija al menos 3 y justifíquelos con evidencia._

- **100 en las cuatro categorías** de Lighthouse (móvil, producción) en las tres páginas de la evidencia.
- **LCP ≤ 1,8 s y CLS = 0** en producción (percentil 75), con el antes y el después de lo que hizo para lograrlo.
- **Prueba en 3 anchos** con Playwright (360/768/1024): sin scroll horizontal y 0 violaciones de axe (`@axe-core/playwright`).
- **Pruebas de accesibilidad de componentes** con axe dentro de Vitest y React Testing Library.
- **Modo oscuro y alto contraste** sin romper el contraste en ningún tema.
- **Presupuesto estricto:** JavaScript transferido ≤ 120 kB, con `next/dynamic` para lo pesado.
- **Navegación accesible:** foco movido y título anunciado en cada cambio de ruta, probado con lector de pantalla.
- **Impresión** (`@media print`) y **SEO avanzado** (JSON-LD, `sitemap`, imágenes Open Graph).
- **Español e inglés** con `lang` correcto y formatos `Intl`.

### 6 · Evidencias a entregar

_Carpeta `calidad/` del repositorio y un archivo `CALIDAD.md`._

- Informes de Lighthouse (móvil y escritorio) de las dos páginas del taller: `/` (con el tablero de 24 cartas) y `/records`. Este taller no tiene inicio de sesión, por eso no se pide la página con sesión iniciada.
- Capturas de las páginas principales en **360, 768 y 1024 px**.
- Resultado de axe y del validador HTML, y la lista de comprobación manual (teclado, zoom 200 %, lector de pantalla) con fecha.
- Tabla de **LCP, INP y CLS** y qué hizo para mejorarlas (antes y después).
- Captura del resultado de `npm run check`.
- Los retos elegidos, cada uno con su evidencia y cómo reproducirla.
- Todo debe poder **demostrarse en vivo** en la sustentación.

## 11. Configuración de la IA del taller (reto adicional)

Antes de usar un asistente de IA en este taller, el estudiante debe **diseñar y configurar su propia configuración de IA**. No se entrega una configuración hecha: pensarla, construirla y comprobarla es parte del reto. Los requisitos detallados y cómo se evalúan se explican en clase (hoja «Configuración de IA»), y son los mismos que se exigen en los proyectos finales. La configuración queda versionada en el **primer commit** del repositorio, **antes** de generar código, y debe cubrir:

- **Reglas del proyecto** para la IA: un archivo de instrucciones propio (`AGENTS.md`, de 100 líneas o menos, con el stack, los comandos, la estructura, lo que sí y lo que no).
- **Restricciones de seguridad:** la IA **no puede leer** `.env`, claves ni credenciales, **no puede salir de la carpeta** del proyecto y las acciones con efecto fuera de su máquina (`git push`, instalar dependencias, `vercel`) piden permiso.
- **Reglas de calidad del código** que se comprueban de forma automática, también sobre el código que escriba la IA: un script `npm run check` que ejecute el chequeo de tipos, ESLint sin advertencias, Prettier y las pruebas. Las pruebas se miden con `vitest run --coverage` (instale `npm i -D @vitest/coverage-v8`) y la **cobertura de la lógica de negocio** debe ser de **80 % o más**, con el umbral configurado para que bajarlo rompa el `check`.
- **Evidencia:** pruebas propias que demuestren que las restricciones funcionan, guardadas en la carpeta `ia/`, y la **bitácora** `ia/BITACORA.md` (propósito, evidencia, validación y decisión de cada uso de la IA, más **al menos 3 casos** en que usted rechazó o corrigió lo que propuso la IA). No comparta contraseñas, claves ni datos personales con la IA.

Todo debe poder **demostrarse en vivo** en la sustentación.

## 12. Rúbrica

| Criterio | Peso |
|---|---|
| Lógica correcta y pura (reductor, barajado, récords) | 25 % |
| Componentes React, hooks y limpieza de efectos | 15 % |
| Metas de calidad y evidencias (accesibilidad, responsivo, Core Web Vitals, Lighthouse) | 20 % |
| Pruebas y `npm run check` | 10 % |
| Configuración de IA y pruebas de contención | 10 % |
| Sustentación en vivo (explicar y modificar) | 15 % |
| Git y bitácora de IA | 5 % |
