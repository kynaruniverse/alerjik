import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  checkIngredients,
  type AllergenResult,
} from "./engine/allergenEngine";

const ALLERGEN_LABELS: Record<string, string> = {
  celery: "Celery",
  gluten: "Cereals containing gluten",
  crustaceans: "Crustaceans",
  eggs: "Eggs",
  fish: "Fish",
  lupin: "Lupin",
  milk: "Milk",
  molluscs: "Molluscs",
  mustard: "Mustard",
  peanuts: "Peanuts",
  sesame: "Sesame",
  soya: "Soya",
  sulphites: "Sulphur dioxide and sulphites",
  nuts: "Nuts",
};

function StatusBadge({ status }: { status: AllergenResult["status"] }) {
  const labels = {
    confirmed: "Allergen identified",
    not_identified: "No regulated allergen identified",
    needs_checking: "Needs checking",
  };

  return (
    <span className={`status status-${status}`}>
      {labels[status]}
    </span>
  );
}

function ResultCard({ result }: { result: AllergenResult }) {
  return (
    <article className="result-card">
      <div className="result-header">
        <div>
          <h3>{result.input}</h3>

          {result.canonicalName && (
            <p className="canonical-name">
              Matched as {result.canonicalName}
            </p>
          )}
        </div>

        <StatusBadge status={result.status} />
      </div>

      {result.allergens.length > 0 && (
        <div className="allergen-list">
          <strong>Allergens:</strong>

          <div className="allergen-tags">
            {result.allergens.map((allergen) => (
              <span className="allergen-tag" key={allergen}>
                {ALLERGEN_LABELS[allergen] ?? allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.status === "needs_checking" && (
        <p className="result-note">
          ALERJIK could not establish a final allergen conclusion from this
          ingredient information. Check the supplier specification or
          ingredient declaration before relying on the result.
        </p>
      )}
    </article>
  );
}

function App() {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState<AllergenResult[]>([]);

  function handleCheck() {
    const checked = checkIngredients(ingredients);
    setResults(checked);
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">UK food label guidance</p>

        <h1>ALERJIK</h1>

        <p className="intro">
          Check your ingredients for regulated allergens and spot information
          that may need checking before you label or sell your food.
        </p>
      </section>

      <section className="checker">
        <label htmlFor="ingredients">
          Ingredients
        </label>

        <p className="helper">
          Paste your ingredient list exactly as it appears on your recipe or
          supplier specification.
        </p>

        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          placeholder="e.g. Wheat flour, butter, eggs, sugar, dark chocolate..."
          rows={10}
        />

        <button
          type="button"
          disabled={!ingredients.trim()}
          onClick={handleCheck}
        >
          Check ingredients
        </button>
      </section>

      {results.length > 0 && (
        <section className="results" aria-label="Allergen check results">
          <div className="results-heading">
            <h2>Check results</h2>
            <p>
              {results.length} ingredient
              {results.length === 1 ? "" : "s"} checked
            </p>
          </div>

          <div className="result-list">
            {results.map((result, index) => (
              <ResultCard
                key={`${result.input}-${index}`}
                result={result}
              />
            ))}
          </div>
        </section>
      )}

      <section className="disclaimer">
        <strong>Compliance guidance, not legal advice.</strong>

        <p>
          ALERJIK helps identify potential allergen and labelling issues from
          the information you provide. It does not replace checking current
          official guidance or obtaining appropriate professional advice.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);