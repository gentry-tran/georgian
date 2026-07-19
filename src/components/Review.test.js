import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Review from "./Review";
import { buildReviewSession } from "../lib/session";
import { reviewWords } from "../data/curriculum";
import { resetProgress, recordLesson } from "../lib/progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

function renderReview() {
  return render(
    <MemoryRouter initialEntries={["/review"]}>
      <Routes>
        <Route path="/review" element={<Review />} />
        <Route path="/" element={<div>roadmap</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Review mode", () => {
  test("empty state when nothing learned yet", () => {
    renderReview();
    expect(screen.getByText(/Nothing to review yet/i)).toBeInTheDocument();
  });

  test("reviewWords collects vocab from completed lessons (not the alphabet)", () => {
    expect(reviewWords()).toHaveLength(0);
    recordLesson("a1-alphabet-see", { correct: 10, total: 10 }); // alphabet excluded
    expect(reviewWords()).toHaveLength(0);
    recordLesson("a1-greetings-1", { correct: 10, total: 10 });
    expect(reviewWords().length).toBeGreaterThanOrEqual(4);
  });

  test("builds a valid review quiz from a word pool", () => {
    recordLesson("a1-greetings-1", { correct: 10, total: 10 });
    recordLesson("a1-greetings-2", { correct: 10, total: 10 });
    const items = buildReviewSession(reviewWords());
    expect(items.length).toBeGreaterThan(0);
    items.forEach((i) => {
      expect(i.choices).toContain(i.answer);
      expect(new Set(i.choices).size).toBe(i.choices.length);
    });
  });

  test("renders a quiz once words are learned", () => {
    recordLesson("a1-greetings-1", { correct: 10, total: 10 });
    recordLesson("a1-greetings-2", { correct: 10, total: 10 });
    renderReview();
    expect(document.querySelector(".progress-track")).toBeInTheDocument();
    expect(screen.getAllByTestId("choice").length).toBeGreaterThan(0);
  });
});
