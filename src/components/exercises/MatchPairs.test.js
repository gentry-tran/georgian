import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchPairs from "./MatchPairs";

function makeItem() {
  return {
    type: "match",
    pairs: [
      { en: "sh", ka: "შ", tr: "sh" },
      { en: "ts (glottal)", ka: "წ", tr: "ts'" },
      { en: "ch", ka: "ჩ", tr: "ch" },
      { en: "h", ka: "ჰ", tr: "h" },
    ],
  };
}

test("English-first clicks complete the exercise", () => {
  const onResult = jest.fn();
  render(<MatchPairs item={makeItem()} onResult={onResult} />);
  for (const p of makeItem().pairs) {
    userEvent.click(screen.getByText(p.en));
    userEvent.click(screen.getByText(p.ka));
  }
  return new Promise((r) => setTimeout(r, 500)).then(() =>
    expect(onResult).toHaveBeenCalledWith(true)
  );
});

test("Georgian-first clicks also match", () => {
  const onResult = jest.fn();
  render(<MatchPairs item={makeItem()} onResult={onResult} />);
  for (const p of makeItem().pairs) {
    userEvent.click(screen.getByText(p.ka)); // Georgian first
    userEvent.click(screen.getByText(p.en));
  }
  return new Promise((r) => setTimeout(r, 500)).then(() =>
    expect(onResult).toHaveBeenCalledWith(true)
  );
});

test("a wrong attempt does not block matching შ or წ afterward", () => {
  const onResult = jest.fn();
  render(<MatchPairs item={makeItem()} onResult={onResult} />);
  // wrong: sh <-> წ
  userEvent.click(screen.getByText("sh"));
  userEvent.click(screen.getByText("წ"));
  // now correct everything
  for (const p of makeItem().pairs) {
    userEvent.click(screen.getByText(p.en));
    userEvent.click(screen.getByText(p.ka));
  }
  return new Promise((r) => setTimeout(r, 600)).then(() =>
    expect(onResult).toHaveBeenCalledWith(true)
  );
});
