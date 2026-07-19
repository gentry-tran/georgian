import React from "react";

// Catches render/lifecycle errors anywhere in the tree so a crash surfaces a
// clear "reload" prompt instead of a silently painted-but-dead screen (the exact
// "buttons don't work" symptom of a swallowed post-paint exception).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the detail in the console for diagnosis.
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 48 }}>🐈</div>
          <h1>Something broke</h1>
          <p style={{ color: "#666" }}>
            The app hit an error. Your progress is safe in this browser.
          </p>
          <pre style={{ whiteSpace: "pre-wrap", color: "#c92a2a", fontSize: 12 }}>
            {String(this.state.error && this.state.error.message)}
          </pre>
          <button
            className="btn-primary"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
