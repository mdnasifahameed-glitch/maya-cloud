import React from "react";
import { Watcher } from "./Watcher.jsx";

export default function App() {
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
