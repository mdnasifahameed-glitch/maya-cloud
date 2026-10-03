import React from "react";
import { Watcher } from "./Watcher.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error("MAYA WATCHER ERROR:", error);
    console.error("COMPONENT INFO:", info);
  }

  render() {
    if (this.state.error) {
      return (
        <main
          style={{
            minHeight: "100vh",
            background: "#05070d",
            color: "#ff6b6b",
            padding: "40px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <h1>Maya Error</h1>

          <p>
            {this.state.error?.message ||
              String(this.state.error)}
          </p>

          <hr />

          <p>
            The deployment works. Watcher is the component
            causing the error.
          </p>
        </main>
      );
    }

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#05070d",
        }}
      >
        <Watcher
          size={180}
          shape="Ball"
          eyes="Slant"
          follow={60}
          bounce={30}
        />
      </main>
    );
  }
}

export default function App() {
  return <ErrorBoundary />;
}
