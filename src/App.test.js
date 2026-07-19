import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LessonSession from "./components/LessonSession";
import MultipleChoice from "./components/exercises/MultipleChoice";
import { resetProgress, completeOnboarding, isOnboarded } from "./lib/progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

describe("Onboarding", () => {
  test("first visit shows the level select; choosing a level onboards", () => {
    render(<App />);
    expect(screen.getByText(/Where should we start/i)).toBeInTheDocument();
    userEvent.click(screen.getByTestId("onb-new"));
    expect(isOnboarded()).toBe(true);
  });
});

describe("Roadmap", () => {
  beforeEach(() => completeOnboarding([]));

  test("renders the journey with the first lesson unlocked", () => {
    render(<App />);
    expect(screen.getByText(/Your Georgian journey/i)).toBeInTheDocument();
    expect(screen.getByTestId("lesson-a1-alphabet-see")).not.toBeDisabled();
  });

  test("later lessons start locked", () => {
    render(<App />);
    expect(screen.getByTestId("lesson-a1-greetings-1")).toBeDisabled();
  });
});

describe("MultipleChoice exercise", () => {
  const item = {
    type: "choose",
    prompt: "hello",
    answer: "გამარჯობა",
    choices: ["გამარჯობა", "არა", "დიახ", "მადლობა"],
    georgianChoices: true,
    speakOnCorrect: "გამარჯობა",
  };

  test("correct pick resolves as correct immediately", () => {
    const onResult = jest.fn();
    render(<MultipleChoice item={item} onResult={onResult} />);
    userEvent.click(screen.getByText("გამარჯობა"));
    expect(onResult).toHaveBeenCalledWith(true);
  });

  test("wrong pick reveals the answer and waits for Continue", () => {
    const onResult = jest.fn();
    render(<MultipleChoice item={item} onResult={onResult} />);
    userEvent.click(screen.getByText("არა"));
    expect(onResult).not.toHaveBeenCalled();
    userEvent.click(screen.getByTestId("continue"));
    expect(onResult).toHaveBeenCalledWith(false);
  });
});

describe("LessonSession", () => {
  test("opens a lesson and shows the first exercise with a progress bar", () => {
    render(
      <MemoryRouter initialEntries={["/learn/a1-numbers-1"]}>
        <Routes>
          <Route path="/learn/:lessonId" element={<LessonSession />} />
        </Routes>
      </MemoryRouter>
    );
    expect(document.querySelector(".progress-track")).toBeInTheDocument();
    expect(screen.getAllByTestId("choice").length).toBeGreaterThan(0);
  });
});
