import {
  checkIngredient,
  checkIngredients,
} from "./allergenEngine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

function testConfirmedAllergen(): void {
  const result = checkIngredient("plain flour");

  assert(
    result.status === "confirmed",
    "plain flour should be confirmed"
  );

  assert(
    result.allergens.includes("gluten"),
    "plain flour should identify gluten"
  );
}

function testAliasMatching(): void {
  const result = checkIngredient("unsalted butter");

  assert(
    result.matchedIngredient === "butter",
    "unsalted butter should match butter"
  );

  assert(
    result.allergens.includes("milk"),
    "butter should identify milk"
  );
}

function testConditionalSoyExemption(): void {
  const result = checkIngredient("fully refined soybean oil");

  assert(
    result.status === "not_identified",
    "fully refined soybean oil should resolve through the exemption rule"
  );

  assert(
    !result.allergens.includes("soya"),
    "exempt fully refined soybean oil should not return soya"
  );
}

function testUnqualifiedSoyOil(): void {
  const result = checkIngredient("soybean oil");

  assert(
    result.status === "needs_checking",
    "unqualified soybean oil should require checking"
  );

  assert(
    result.allergens.includes("soya"),
    "unqualified soybean oil should retain the soya allergen"
  );
}

function testCompoundIngredient(): void {
  const result = checkIngredient("dark chocolate");

  assert(
    result.status === "needs_checking",
    "dark chocolate should require sub-ingredient checking"
  );

  assert(
    result.rulesTriggered.includes(
      "compound_ingredient_requires_subingredients"
    ),
    "dark chocolate should trigger the compound ingredient rule"
  );
}

function testUnknownIngredient(): void {
  const result = checkIngredient("Charles's Secret Ingredient");

  assert(
    result.status === "needs_checking",
    "unknown ingredients should require checking"
  );

  assert(
    result.matchedIngredient === null,
    "unknown ingredients should not match a database entry"
  );
}

function testMultipleIngredients(): void {
  const results = checkIngredients(
    "plain flour, butter, eggs, sugar"
  );

  assert(
    results.length === 4,
    "four comma-separated ingredients should produce four results"
  );

  assert(
    results[0].allergens.includes("gluten"),
    "first ingredient should identify gluten"
  );

  assert(
    results[1].allergens.includes("milk"),
    "second ingredient should identify milk"
  );

  assert(
    results[2].allergens.includes("eggs"),
    "third ingredient should identify eggs"
  );

  assert(
    results[3].status === "needs_checking",
    "unknown sugar entry should currently require checking"
  );
}

export function runAllergenEngineTests(): void {
  testConfirmedAllergen();
  testAliasMatching();
  testConditionalSoyExemption();
  testUnqualifiedSoyOil();
  testCompoundIngredient();
  testUnknownIngredient();
  testMultipleIngredients();

  console.log("ALERJIK allergen engine tests passed.");
}