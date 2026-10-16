import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProjectDetail } from "./ProjectDetail";

describe("ProjectDetail", () => {
  it("URLの :id に対応するプロジェクトが表示される", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/task-board"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "タスクボード" }),
    ).toBeInTheDocument();
  });
});
