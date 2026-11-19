import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PaginaRecords from "@/app/records/page";
import { config } from "@/lib/config";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

const FECHA = "2026-11-19T12:00:00.000Z";

describe("página /records", () => {
  it("muestra el estado vacío cuando no hay datos", () => {
    render(<PaginaRecords />);
    expect(screen.getByRole("heading", { level: 1, name: "Récords" })).toBeInTheDocument();
    expect(screen.getByText("Aún no hay récords.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jugar una partida" })).toHaveAttribute("href", "/");
  });

  it("muestra el estado vacío si los datos están dañados", () => {
    localStorage.setItem(config.claveRecords, "{esto no es JSON");
    render(<PaginaRecords />);
    expect(screen.getByText("Aún no hay récords.")).toBeInTheDocument();
  });

  it("muestra el estado vacío si localStorage está bloqueado", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("bloqueado", "SecurityError");
    });
    render(<PaginaRecords />);
    expect(screen.getByText("Aún no hay récords.")).toBeInTheDocument();
  });

  it("lista el mejor resultado de cada tamaño y permite borrarlos con confirmación", () => {
    localStorage.setItem(
      config.claveRecords,
      JSON.stringify({ 16: { movimientos: 11, segundos: 75, fecha: FECHA } }),
    );
    render(<PaginaRecords />);
    const fila16 = screen.getByRole("row", { name: /16 cartas/ });
    expect(fila16).toHaveTextContent("11");
    expect(fila16).toHaveTextContent("1:15");
    expect(screen.getByRole("row", { name: /12 cartas/ })).toHaveTextContent("Sin récord");

    fireEvent.click(screen.getByRole("button", { name: "Borrar récords" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Borrar récords" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, borrar" }));
    expect(screen.getByText("Récords borrados.")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay récords.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mejores resultados" })).toHaveFocus();
    expect(localStorage.getItem(config.claveRecords)).toBeNull();
  });
});
