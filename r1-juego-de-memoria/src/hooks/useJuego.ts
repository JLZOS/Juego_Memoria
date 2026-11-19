import { useEffect, useReducer, useState } from "react";
import { config as entorno } from "@/lib/config";
import { describirTiempo } from "@/lib/formato";
import { estadoInicial, juegoReducer } from "@/lib/juegoReducer";
import { crearCartas } from "@/lib/memoria";
import { guardarRecord, type ResultadoGuardado } from "@/lib/records";
import { TEMAS, parejasDe, type IdTema, type Tamano } from "@/lib/temas";
import { usePestanaOculta } from "./usePestanaOculta";

export type ConfigJuego = { tamano: Tamano; tema: IdTema };

function cartasDe({ tamano, tema }: ConfigJuego, aleatorio?: () => number) {
  return crearCartas(TEMAS[tema].simbolos, parejasDe(tamano), aleatorio);
}

// Next.js prohíbe Math.random() durante el prerenderizado. En el servidor se usa un orden fijo;
// el HTML es igual en ambos lados porque las cartas boca abajo no muestran su símbolo.
function iniciar(configuracion: ConfigJuego) {
  const enServidor = typeof window === "undefined";
  return estadoInicial(cartasDe(configuracion, enServidor ? () => 0 : Math.random));
}

export function useJuego(configInicial: ConfigJuego) {
  const [estado, dispatch] = useReducer(juegoReducer, configInicial, iniciar);
  const [configuracion, setConfiguracion] = useState(configInicial);
  const [anuncio, setAnuncio] = useState("");
  const [guardado, setGuardado] = useState<ResultadoGuardado | null>(null);
  const pestanaOculta = usePestanaOculta();

  const comparando = estado.volteadas.length === 2;
  const cronometroActivo = estado.fase === "jugando" && !pestanaOculta;
  const totalParejas = estado.cartas.length / 2;
  const parejasEncontradas = estado.cartas.filter((c) => c.descubierta).length / 2;

  useEffect(() => {
    if (!comparando) return;
    const temporizador = setTimeout(
      () => dispatch({ tipo: "resolver" }),
      entorno.tiempoComparacionMs,
    );
    return () => clearTimeout(temporizador);
  }, [comparando]);

  useEffect(() => {
    if (!cronometroActivo) return;
    const intervalo = setInterval(() => dispatch({ tipo: "tic" }), 1000);
    return () => clearInterval(intervalo);
  }, [cronometroActivo]);

  function voltear(id: number) {
    const accion = { tipo: "voltear", id } as const;
    const siguiente = juegoReducer(estado, accion);
    if (siguiente === estado) return;
    dispatch(accion);
    if (siguiente.movimientos === estado.movimientos) return;

    const { movimientos, segundos, fase, volteadas, cartas } = siguiente;
    if (fase === "fin") {
      const resultado = guardarRecord(configuracion.tamano, {
        movimientos,
        segundos,
        fecha: new Date().toISOString(),
      });
      setGuardado(resultado);
      setAnuncio(
        `¡Ganaste! Encontraste todas las parejas en ${movimientos} movimientos y ${describirTiempo(segundos)}.` +
          (resultado === "nuevo" ? " ¡Nuevo récord!" : ""),
      );
    } else if (volteadas.length === 2) {
      setAnuncio(`Las cartas no coinciden. Movimiento ${movimientos}.`);
    } else {
      const encontradas = cartas.filter((c) => c.descubierta).length / 2;
      setAnuncio(`Pareja encontrada. Llevas ${encontradas} de ${cartas.length / 2}.`);
    }
  }

  function reiniciar(nueva: ConfigJuego = configuracion) {
    setConfiguracion(nueva);
    dispatch({ tipo: "reiniciar", cartas: cartasDe(nueva) });
    setGuardado(null);
    setAnuncio(`Nueva partida: ${nueva.tamano} cartas, tema ${TEMAS[nueva.tema].nombre}.`);
  }

  return {
    estado,
    configuracion,
    anuncio,
    guardado,
    comparando,
    parejasEncontradas,
    totalParejas,
    voltear,
    reiniciar,
  };
}
