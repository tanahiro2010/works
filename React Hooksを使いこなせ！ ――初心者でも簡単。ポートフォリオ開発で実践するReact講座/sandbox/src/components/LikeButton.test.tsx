import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LikeButton } from "./LikeButton";

describe("LikeButton", () => {
  it("クリックするたびに いいね状態とカウントが増減する", async () => {
    const user = userEvent.setup();
    render(<LikeButton initialCount={10} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("10");
    expect(button).toHaveTextContent("🤍");

    await user.click(button);
    expect(button).toHaveTextContent("11");
    expect(button).toHaveTextContent("❤️");

    await user.click(button);
    expect(button).toHaveTextContent("10");
    expect(button).toHaveTextContent("🤍");
  });
});
