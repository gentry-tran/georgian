import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TypeAnswer from "./TypeAnswer";

const item = {
  type: "type",
  audio: "გამარჯობა",
  answer: "gamarjoba",
  reveal: "გამარჯობა (hello)",
};

test("correct typing (lenient match) resolves as correct", () => {
  const onResult = jest.fn();
  render(<TypeAnswer item={item} onResult={onResult} />);
  // extra caps/spaces/punct should still pass
  userEvent.type(screen.getByTestId("type-input"), " Gamarjoba! ");
  userEvent.click(screen.getByTestId("type-check"));
  userEvent.click(screen.getByTestId("type-continue"));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("wrong typing reveals the answer then resolves as wrong", () => {
  const onResult = jest.fn();
  render(<TypeAnswer item={item} onResult={onResult} />);
  userEvent.type(screen.getByTestId("type-input"), "wrong");
  userEvent.click(screen.getByTestId("type-check"));
  expect(screen.getByText(/gamarjoba/i)).toBeInTheDocument();
  expect(onResult).not.toHaveBeenCalled();
  userEvent.click(screen.getByTestId("type-continue"));
  expect(onResult).toHaveBeenCalledWith(false);
});
