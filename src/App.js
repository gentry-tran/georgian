import "./App.css";
import { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Roadmap from "./components/Roadmap";
import LessonSession from "./components/LessonSession";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import Review from "./components/Review";
import ErrorBoundary from "./components/ErrorBoundary";
import { isOnboarded, subscribe } from "./lib/progress";

// First visit → level-select onboarding; afterwards → the roadmap. Reactive to
// the progress store so choosing a level immediately swaps in the roadmap
// (navigate("/") from "/" alone would not re-render).
function Home() {
  const [onboarded, setOnboarded] = useState(isOnboarded());
  useEffect(() => subscribe(() => setOnboarded(isOnboarded())), []);
  return onboarded ? <Roadmap /> : <Onboarding />;
}

// HashRouter keeps the app fully static — it runs from any local folder, a
// plain file server, or the Docker/nginx image with zero server-side routing.
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:lessonId" element={<LessonSession />} />
          <Route path="/review" element={<Review />} />
          <Route path="/progress" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <div className="notfound">
                <h1>404</h1>
                <Link to="/" className="btn-primary">
                  Back to your journey
                </Link>
              </div>
            }
          />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
