import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main>
      <h1>ALERJIK</h1>
      <p>Food label and allergen guidance for UK food businesses.</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);