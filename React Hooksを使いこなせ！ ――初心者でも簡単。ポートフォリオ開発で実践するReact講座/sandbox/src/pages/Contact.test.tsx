import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Contact } from "./Contact";

describe("Contact", () => {
  it("ページを開くとお名前欄に自動でフォーカスが当たる", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("山田 太郎")).toHaveFocus();
  });

  it("入力して送信すると、入力した名前を含む完了メッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByPlaceholderText("山田 太郎"), "田中太郎");
    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "taro@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("お問い合わせ内容をご記入ください"),
      "こんにちは",
    );
    await user.click(screen.getByRole("button", { name: "送信する" }));

    expect(
      await screen.findByText((text) => text.includes("田中太郎")),
    ).toBeInTheDocument();
  });
});
