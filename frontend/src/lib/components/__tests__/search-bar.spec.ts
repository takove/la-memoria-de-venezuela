import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { goto } from "$app/navigation";
import SearchBar from "../SearchBar.svelte";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to search on button click", async () => {
    render(SearchBar);

    const input = screen.getByPlaceholderText(
      "Buscar funcionarios, sanciones, casos...",
    );
    const button = screen.getByLabelText("Buscar");

    await fireEvent.input(input, { target: { value: "maduro" } });
    await fireEvent.click(button);

    expect(goto).toHaveBeenCalledWith("/search?q=maduro");
  });

  it("navigates to search on Enter key", async () => {
    render(SearchBar);

    const input = screen.getByPlaceholderText(
      "Buscar funcionarios, sanciones, casos...",
    );

    await fireEvent.input(input, { target: { value: "padrino" } });
    await fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(goto).toHaveBeenCalledWith("/search?q=padrino");
  });

  it("does not navigate when query is empty", async () => {
    render(SearchBar);

    const input = screen.getByPlaceholderText(
      "Buscar funcionarios, sanciones, casos...",
    );
    const button = screen.getByLabelText("Buscar");

    await fireEvent.input(input, { target: { value: "   " } });
    await fireEvent.click(button);

    expect(goto).not.toHaveBeenCalled();
  });
});
