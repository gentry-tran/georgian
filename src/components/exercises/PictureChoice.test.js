import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PictureChoice from "./PictureChoice";
import { emojiFor } from "../../lib/emoji";

test("shows the emoji and resolves correct on the right word", () => {
  const onResult = jest.fn();
  const item = {
    type: "picture",
    emoji: "🐈",
    answer: "კატა",
    choices: ["კატა", "ძაღლი", "სახლი", "წყალი"],
    speakOnCorrect: "კატა",
  };
  render(<PictureChoice item={item} onResult={onResult} />);
  expect(screen.getByText("🐈")).toBeInTheDocument();
  userEvent.click(screen.getByText("კატა"));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("emojiFor maps concrete words and handles qualifiers", () => {
  expect(emojiFor("cat")).toBe("🐈");
  expect(emojiFor("coffee")).toBe("☕");
  expect(emojiFor("hello (polite)")).toBe(null);
  expect(emojiFor("")).toBe(null);
});
