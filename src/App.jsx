import React from "react";
import Watcher from "./Watcher.jsx";

export default function App() {
  return (
    <main className="maya-app">
      <section className="maya-center">
        <Watcher
          size={300}
          follow={70}
          bounce={30}
        />

        <div className="maya-name">
          <span className="maya-dot" />
          MAYA
        </div>

        <div className="maya-subtitle">
          Personal AI Assistant
        </div>
      </section>
    </main>
  );
}
