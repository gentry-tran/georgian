import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { resetProgress, recordLesson, completeOnboarding, totalXp } from "./lib/progress";

beforeEach(() => {
  localStorage.clear();
  resetProgress();
  window.location.hash = "#/"; // HashRouter shares window.location across tests
});

describe("end-to-end wiring", () => {
  test("onboarding → roadmap → open a lesson", async () => {
    render(<App />);
    // first visit: level select
    expect(screen.getByText(/Where should we start/i)).toBeInTheDocument();

    // pick "I know the alphabet" — alphabet lessons should now be unlocked-done
    userEvent.click(screen.getByTestId("onb-alphabet"));

    // roadmap appears
    await waitFor(() =>
      expect(screen.getByText(/Your Georgian journey/i)).toBeInTheDocument()
    );
    // greetings unlocked because the alphabet was marked known
    const greetings = screen.getByTestId("lesson-a1-greetings-1");
    expect(greetings).not.toBeDisabled();

    // open it → lesson session renders an exercise
    userEvent.click(greetings);
    await waitFor(() =>
      expect(document.querySelector(".progress-track")).toBeInTheDocument()
    );
    expect(screen.getAllByTestId("choice").length).toBeGreaterThan(0);
  });

  test("dashboard reflects recorded progress", async () => {
    completeOnboarding([]);
    recordLesson("a1-alphabet-see", { correct: 10, total: 10 });
    expect(totalXp()).toBeGreaterThan(0);

    render(<App />);
    // header stats link → dashboard
    userEvent.click(screen.getByTitle(/View your progress/i));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Your progress" })).toBeInTheDocument()
    );
    expect(screen.getByText(/Total XP/i)).toBeInTheDocument();
    expect(screen.getByText(/Words practiced/i)).toBeInTheDocument();
  });
});
