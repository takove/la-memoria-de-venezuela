import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Badge from "../Badge.svelte";

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(Badge, { text: "Test Badge" });

      const badge = screen.getByTestId("badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Test Badge");
    });

    it("renders danger variant", () => {
      render(Badge, { variant: "danger", text: "Sanción Activa" });

      const badge = screen.getByTestId("badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Sanción Activa");
      expect(badge).toHaveAttribute("data-variant", "danger");
      expect(badge.className).toContain("bg-memoria-danger");
      expect(badge.className).toContain("text-white");
    });

    it("renders success variant", () => {
      render(Badge, { variant: "success", text: "Condenado" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Condenado");
      expect(badge).toHaveAttribute("data-variant", "success");
      expect(badge.className).toContain("bg-memoria-justice");
      expect(badge.className).toContain("text-white");
    });

    it("renders warning variant", () => {
      render(Badge, { variant: "warning", text: "Investigación" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Investigación");
      expect(badge).toHaveAttribute("data-variant", "warning");
      expect(badge.className).toContain("bg-memoria-warning");
      expect(badge.className).toContain("text-black");
    });

    it("renders neutral variant", () => {
      render(Badge, { variant: "neutral", text: "Archivado" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("Archivado");
      expect(badge).toHaveAttribute("data-variant", "neutral");
      expect(badge.className).toContain("bg-memoria-neutral");
      expect(badge.className).toContain("text-black");
    });
  });

  describe("Sizes", () => {
    it("renders small size", () => {
      render(Badge, { text: "Small", size: "sm" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-size", "sm");
      expect(badge.className).toContain("px-2");
      expect(badge.className).toContain("text-xs");
    });

    it("renders medium size (default)", () => {
      render(Badge, { text: "Medium" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-size", "md");
      expect(badge.className).toContain("px-2.5");
      expect(badge.className).toContain("text-sm");
    });

    it("renders large size", () => {
      render(Badge, { text: "Large", size: "lg" });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-size", "lg");
      expect(badge.className).toContain("px-3");
      expect(badge.className).toContain("text-base");
    });
  });

  describe("All Variant Combinations", () => {
    const variants = ["danger", "success", "warning", "neutral"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`renders ${variant} variant with ${size} size`, () => {
          render(Badge, { variant, text: `${variant}-${size}`, size });

          const badge = screen.getByTestId("badge");
          expect(badge).toBeInTheDocument();
          expect(badge).toHaveTextContent(`${variant}-${size}`);
          expect(badge).toHaveAttribute("data-variant", variant);
          expect(badge).toHaveAttribute("data-size", size);
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA structure", () => {
      render(Badge, { text: "Accessible Badge" });

      const badge = screen.getByTestId("badge");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
    });

    it("renders text content properly", () => {
      const longText =
        "This is a very long badge text that should still render properly";
      render(Badge, { text: longText });

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent(longText);
    });
  });

  describe("Visual Consistency", () => {
    it("applies consistent base classes", () => {
      render(Badge, { text: "Test" });

      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("inline-flex");
      expect(badge.className).toContain("items-center");
      expect(badge.className).toContain("rounded-full");
      expect(badge.className).toContain("font-medium");
    });

    it("combines size and variant classes correctly", () => {
      render(Badge, { variant: "danger", text: "Test", size: "lg" });

      const badge = screen.getByTestId("badge");
      // Should have both size and variant classes
      expect(badge.className).toContain("px-3"); // lg size
      expect(badge.className).toContain("bg-memoria-danger"); // danger variant
    });
  });
});
