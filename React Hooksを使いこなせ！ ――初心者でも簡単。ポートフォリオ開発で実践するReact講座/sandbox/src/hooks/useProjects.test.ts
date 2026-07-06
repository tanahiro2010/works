import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import projectsData from "../data/projects.json";
import { useProjects } from "./useProjects";

describe("useProjects", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("最初は isLoading:true / projects:[] で、時間経過後にデータが入る", async () => {
    const { result } = renderHook(() => useProjects());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.projects).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.projects).toHaveLength(projectsData.length);
  });
});
