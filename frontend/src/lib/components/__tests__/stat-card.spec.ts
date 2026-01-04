import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StatCard from "../StatCard.svelte";

describe("StatCard", () => {
  it("renders icon, value, and label", () => {
    render(StatCard, { label: "Sanciones", value: "150", icon: "ban" });

    expect(screen.getByText("🚫")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Sanciones")).toBeInTheDocument();
  });

  it("falls back to default icon when unknown key provided", () => {
    render(StatCard, { label: "Casos", value: "12", icon: "unknown" });

    expect(screen.getByText("📊")).toBeInTheDocument();
  });
});
