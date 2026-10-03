import React from "react";
import { Watcher } from "./Watcher.jsx";

export default function App() {
  return (
    <main className="maya-app">
      <Watcher
        size={320}
        shape="Ball"
        eyes="Slant"
        follow={60}
        bounce={30}
      />
    </main>
  );
}
