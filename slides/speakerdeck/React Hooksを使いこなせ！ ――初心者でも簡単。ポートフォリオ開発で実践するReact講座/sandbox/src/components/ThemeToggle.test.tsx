import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("クリックするたびにラベルが ダーク/ライト で切り替わる", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "テーマ切り替え" });
    expect(button).toHaveTextContent("ダーク");

    await user.click(button);
    expect(button).toHaveTextContent("ライト");

    await user.click(button);
    expect(button).toHaveTextContent("ダーク");
  });

  it("ダークモード中は <html> に dark クラスが付く", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(screen.getByRole("button", { name: "テーマ切り替え" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: "テーマ切り替え" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
