import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("検索ワードを入力すると一致するプロジェクトだけが表示される", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    );

    // ローディングが終わるのを待つ（useProjectsが実装済みでも未実装でも通る）
    await screen.findByText("タスクボード");
    expect(screen.getByText("レシピシェア")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("プロジェクト名やタグで検索..."),
      "タスク",
    );

    expect(screen.getByText("タスクボード")).toBeInTheDocument();
    expect(screen.queryByText("レシピシェア")).not.toBeInTheDocument();
  });
});
