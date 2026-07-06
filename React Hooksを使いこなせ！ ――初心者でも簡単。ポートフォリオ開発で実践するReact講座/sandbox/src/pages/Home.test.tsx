import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Home } from "./Home";

describe("Home", () => {
  // 注意: このテストはuseMemoの有無ではなく「表示結果が正しいか」を確認する
  // 回帰テストです（useMemoは表示結果を変えず、再計算の回数だけを変えるため）。
  it("いいね数が多い順に上位3件を表示する", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const headings = await screen.findAllByRole("heading", { level: 3 });
    const titles = headings.map((h) => h.textContent);

    expect(titles).toEqual(["タスクボード", "お小遣い帳", "レシピシェア"]);
  });
});
