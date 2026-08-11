import ingredientData from "../data/ingredients.json";
import ruleData from "../data/allergen-rules.json";

export type AllergenStatus =
  | "confirmed"
  | "not_identified"
  | "needs_checking";

export type AllergenResult = {
  input: string;
  matchedIngredient: string | null;
  canonicalName: string | null;
  allergens: string[];
  status: AllergenStatus;
  matchedBy: "canonical_name" | "alias" | "none";
  rulesTriggered: string[];
};

type IngredientDefinition = {
  canonical_name: string;
  aliases: string[];
  allergens: string[];
  default_status: AllergenStatus;
  rules: string[];
};

type RuleDefinition = {
  type: string;
  allergen?: string;
  condition: string;
  result_if_condition_met?: AllergenStatus;
  result_if_condition_unmet?: AllergenStatus;
  result?: AllergenStatus;
};

const ingredients = ingredientData.ingredients as Record<
  string,
  IngredientDefinition
>;

const rules = ruleData.rules as Record<string, RuleDefinition>;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[()[\],.:;]/g, " ")
    .replace(/\s+/g, " ");
}

function findIngredient(input: string) {
  const normalisedInput = normalise(input);

  for (const [id, ingredient] of Object.entries(ingredients)) {
    if (normalise(ingredient.canonical_name) === normalisedInput) {
      return {
        id,
        ingredient,
        matchedBy: "canonical_name" as const,
      };
    }

    const aliasMatch = ingredient.aliases.some(
      (alias) => normalise(alias) === normalisedInput
    );

    if (aliasMatch) {
      return {
        id,
        ingredient,
        matchedBy: "alias" as const,
      };
    }
  }

  return null;
}

function evaluateRules(
  ingredient: IngredientDefinition,
  input: string
): {
  status: AllergenStatus;
  allergens: string[];
  rulesTriggered: string[];
} {
  let status = ingredient.default_status;
  let allergens = [...ingredient.allergens];
  const rulesTriggered: string[] = [];

  for (const ruleId of ingredient.rules) {
    const rule = rules[ruleId];

    if (!rule) {
      continue;
    }

    if (rule.type === "conditional_exemption") {
      if (
        rule.condition === "ingredient_is_confirmed_fully_refined" &&
        /fully refined/i.test(input)
      ) {
        status = rule.result_if_condition_met ?? status;

        if (rule.allergen) {
          allergens = allergens.filter(
            (allergen) => allergen !== rule.allergen
          );
        }

        rulesTriggered.push(ruleId);
      } else {
        status = rule.result_if_condition_unmet ?? status;
        rulesTriggered.push(ruleId);
      }
    }

    if (rule.type === "verification") {
      status = rule.result ?? status;
      rulesTriggered.push(ruleId);
    }
  }

  return {
    status,
    allergens,
    rulesTriggered,
  };
}

export function checkIngredient(input: string): AllergenResult {
  const cleanedInput = input.trim();

  if (!cleanedInput) {
    return {
      input,
      matchedIngredient: null,
      canonicalName: null,
      allergens: [],
      status: "needs_checking",
      matchedBy: "none",
      rulesTriggered: [],
    };
  }

  const match = findIngredient(cleanedInput);

  if (!match) {
    return {
      input: cleanedInput,
      matchedIngredient: null,
      canonicalName: null,
      allergens: [],
      status: "needs_checking",
      matchedBy: "none",
      rulesTriggered: [],
    };
  }

  const evaluated = evaluateRules(match.ingredient, cleanedInput);

  return {
    input: cleanedInput,
    matchedIngredient: match.id,
    canonicalName: match.ingredient.canonical_name,
    allergens: evaluated.allergens,
    status: evaluated.status,
    matchedBy: match.matchedBy,
    rulesTriggered: evaluated.rulesTriggered,
  };
}

export function checkIngredients(input: string): AllergenResult[] {
  return input
    .split(/\r?\n|,/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .map(checkIngredient);
}