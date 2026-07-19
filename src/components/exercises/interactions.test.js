// UI click-tests for EVERY exercise's buttons. Renders each exercise with a mock
// item and simulates the real button clicks, asserting the onResult callback
// fires correctly. If any button is broken (no handler / wrong wiring / disabled),
// this fails. This is the executable "are the buttons working" review.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MultipleChoice from "./MultipleChoice";
import ListenChoice from "./ListenChoice";
import PictureChoice from "./PictureChoice";
import DialogueReply from "./DialogueReply";
import SpeakCard from "./SpeakCard";
import BuildSentence from "./BuildSentence";
import TypeAnswer from "./TypeAnswer";
import ChoiceGrid from "./ChoiceGrid";

const click = (el) => userEvent.click(el);

test("MultipleChoice: clicking the correct choice reports true", () => {
  const onResult = jest.fn();
  render(<MultipleChoice item={{ type: "choose", prompt: "hello", answer: "გამარჯობა", choices: ["გამარჯობა", "ნახვამდის", "დიახ", "არა"], georgianChoices: true }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "გამარჯობა" }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("MultipleChoice: a wrong choice reveals answer + Continue reports false", () => {
  const onResult = jest.fn();
  render(<MultipleChoice item={{ type: "choose", prompt: "hello", answer: "გამარჯობა", choices: ["გამარჯობა", "ნახვამდის", "დიახ", "არა"], georgianChoices: true }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "ნახვამდის" }));
  expect(onResult).not.toHaveBeenCalled(); // waits for Continue
  click(screen.getByTestId("continue"));
  expect(onResult).toHaveBeenCalledWith(false);
});

test("ListenChoice: clicking the correct meaning reports true", () => {
  const onResult = jest.fn();
  render(<ListenChoice item={{ type: "listen", audio: "გამარჯობა", answer: "hello", choices: ["hello", "bye", "yes", "no"] }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "hello" }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("ListenChoice: the 🔊 replay button does not throw", () => {
  render(<ListenChoice item={{ type: "listen", audio: "გამარჯობა", answer: "hello", choices: ["hello", "bye", "yes", "no"] }} onResult={jest.fn()} />);
  expect(() => click(screen.getByRole("button", { name: "🔊" }))).not.toThrow();
});

test("PictureChoice: clicking the correct word reports true", () => {
  const onResult = jest.fn();
  render(<PictureChoice item={{ emoji: "🏠", answer: "სახლი", choices: ["სახლი", "წიგნი", "მანქანა", "კატა"], speakOnCorrect: "სახლი" }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "სახლი" }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("DialogueReply: clicking the correct reply reports true", () => {
  const onResult = jest.fn();
  render(<DialogueReply item={{ lines: [{ who: "A", ka: "როგორ ხარ?", tr: "rogor khar", en: "how are you?" }], speaker: "You", en: "I'm fine", answer: "კარგად", choices: ["კარგად", "დიახ", "არა", "გმადლობ "] }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "კარგად" }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("SpeakCard: 'I said it' reports true and 'Hear it' does not throw", () => {
  const onResult = jest.fn();
  render(<SpeakCard item={{ en: "hello", ka: "გამარჯობა", tr: "gamarjoba" }} onResult={onResult} />);
  expect(() => click(screen.getByRole("button", { name: /Hear it/ }))).not.toThrow();
  click(screen.getByRole("button", { name: /I said it/ }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("BuildSentence: tapping tokens in order, Check, then Continue reports true", () => {
  const onResult = jest.fn();
  render(<BuildSentence item={{ en: "I am", tr: "me var", answer: ["მე", "ვარ"], tokens: ["მე", "ვარ"] }} onResult={onResult} />);
  click(screen.getByRole("button", { name: "მე" }));
  click(screen.getByRole("button", { name: "ვარ" }));
  click(screen.getByRole("button", { name: "Check" }));
  click(screen.getByRole("button", { name: "Continue" }));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("TypeAnswer: typing the answer, Check, then Continue reports true", () => {
  const onResult = jest.fn();
  render(<TypeAnswer item={{ answer: "gamarjoba", prompt: "hello", reveal: "გამარჯობა" }} onResult={onResult} />);
  userEvent.type(screen.getByTestId("type-input"), "gamarjoba");
  click(screen.getByTestId("type-check"));
  click(screen.getByTestId("type-continue"));
  expect(onResult).toHaveBeenCalledWith(true);
});

test("ChoiceGrid: correct pick is immediate; the button isn't dead", () => {
  const onResolve = jest.fn();
  render(<ChoiceGrid choices={["a", "b", "c", "d"]} answer="a" georgian={false} onResolve={onResolve} />);
  click(screen.getByRole("button", { name: "a" }));
  expect(onResolve).toHaveBeenCalledWith(true);
});
