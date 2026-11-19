import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Juego } from "@/components/Juego";
import { leerRecords } from "@/lib/records";

// Con Math.random ≈ 1, Fisher–Yates deja el orden original: la carta N forma pareja con la N + 6.
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Math, "random").mockReturnValue(0.999999);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const carta = (posicion: number) =>
  screen.getByRole("button", { name: new RegExp(`^Carta ${posicion},`) });
const estadoJuego = () =>
  screen.getByText(/Elige una carta|Pareja encontrada|no coinciden|Ganaste|Nueva partida/, {
    selector: "p[aria-live]",
  });

describe("<Juego />", () => {
  it("al hacer clic en una carta cambia su aria-label", () => {
    render(<Juego />);
    expect(screen.getAllByRole("button", { name: /boca abajo/ })).toHaveLength(12);
    const primera = carta(1);
    expect(primera).toHaveAccessibleName("Carta 1, boca abajo");
    expect(primera).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(primera);
    expect(primera).toHaveAccessibleName("Carta 1, 🐶");
    expect(primera).toHaveAttribute("aria-pressed", "true");
  });

  it("se juega con teclado: Enter y Espacio voltean cartas", async () => {
    const usuario = userEvent.setup();
    render(<Juego />);
    carta(1).focus();
    await usuario.keyboard("{Enter}");
    expect(carta(1)).toHaveAccessibleName("Carta 1, 🐶");
    carta(7).focus();
    await usuario.keyboard(" ");
    expect(carta(7)).toHaveAccessibleName("Carta 7, 🐶, pareja encontrada");
    expect(carta(7)).toHaveAttribute("aria-disabled", "true");
  });

  it("dos cartas iguales quedan descubiertas, el contador sube 1 y se anuncia", () => {
    render(<Juego />);
    fireEvent.click(carta(2));
    fireEvent.click(carta(8));
    expect(carta(2)).toHaveAccessibleName(/pareja encontrada/);
    expect(carta(8)).toHaveAccessibleName(/pareja encontrada/);
    expect(
      within(screen.getByText("Movimientos").parentElement!).getByText("1"),
    ).toBeInTheDocument();
    expect(estadoJuego()).toHaveTextContent("Pareja encontrada. Llevas 1 de 6.");
  });

  it("dos cartas distintas se ocultan solas a los 800 ms y mientras tanto no se voltea otra", () => {
    vi.useFakeTimers();
    render(<Juego />);
    fireEvent.click(carta(1));
    fireEvent.click(carta(2));
    expect(estadoJuego()).toHaveTextContent("Las cartas no coinciden. Movimiento 1.");
    fireEvent.click(carta(3));
    expect(carta(3)).toHaveAccessibleName("Carta 3, boca abajo");
    act(() => vi.advanceTimersByTime(799));
    expect(carta(1)).toHaveAccessibleName("Carta 1, 🐶");
    act(() => vi.advanceTimersByTime(1));
    expect(carta(1)).toHaveAccessibleName("Carta 1, boca abajo");
    expect(carta(2)).toHaveAccessibleName("Carta 2, boca abajo");
  });

  it("un clic doble rápido sobre la misma carta no cuenta como segunda carta", () => {
    render(<Juego />);
    fireEvent.click(carta(4));
    fireEvent.click(carta(4));
    expect(
      within(screen.getByText("Movimientos").parentElement!).getByText("0"),
    ).toBeInTheDocument();
    expect(carta(4)).toHaveAccessibleName("Carta 4, 🐹");
  });

  it("al terminar la partida aparece el mensaje de victoria y se guarda el récord", () => {
    vi.useFakeTimers();
    render(<Juego />);
    fireEvent.click(carta(1));
    fireEvent.click(carta(2));
    act(() => vi.advanceTimersByTime(800));
    for (let n = 1; n <= 6; n++) {
      fireEvent.click(carta(n));
      fireEvent.click(carta(n + 6));
    }
    const victoria = screen.getByRole("heading", { name: /¡Ganaste!/ });
    expect(victoria).toBeInTheDocument();
    expect(victoria).toHaveFocus();
    expect(screen.getByText(/¡Nuevo récord para 12 cartas!/)).toBeInTheDocument();
    expect(estadoJuego()).toHaveTextContent(/¡Ganaste!.*7 movimientos/);
    expect(leerRecords()[12]).toMatchObject({ movimientos: 7 });

    fireEvent.click(screen.getByRole("button", { name: "Jugar otra vez" }));
    expect(screen.queryByRole("heading", { name: /¡Ganaste!/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /boca abajo/ })).toHaveLength(12);
  });

  it("el cronómetro empieza con la primera carta y se pausa con la pestaña oculta", () => {
    vi.useFakeTimers();
    let oculta = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => oculta);
    render(<Juego />);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("0:00")).toBeInTheDocument();

    fireEvent.click(carta(1));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("0:03")).toBeInTheDocument();

    oculta = true;
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("0:03")).toBeInTheDocument();

    oculta = false;
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("0:04")).toBeInTheDocument();
  });

  it("cambiar el tamaño a mitad de partida pide confirmación", () => {
    render(<Juego />);
    fireEvent.click(carta(1));
    fireEvent.click(screen.getByRole("radio", { name: /16 cartas/ }));
    const dialogo = screen.getByRole("dialog", { name: "¿Empezar una partida nueva?" });
    expect(screen.getByRole("radio", { name: /12 cartas/ })).toBeChecked();

    fireEvent.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Carta/ })).toHaveLength(12);

    fireEvent.click(screen.getByRole("radio", { name: /24 cartas/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, reiniciar" }));
    expect(screen.getByRole("radio", { name: /24 cartas/ })).toBeChecked();
    expect(screen.getAllByRole("button", { name: /boca abajo/ })).toHaveLength(24);
  });

  it("antes de empezar, cambiar de tema reinicia sin preguntar", () => {
    render(<Juego />);
    fireEvent.change(screen.getByLabelText("Tema"), { target: { value: "deportes" } });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(carta(1));
    expect(carta(1)).toHaveAccessibleName("Carta 1, ⚽");
  });
});
