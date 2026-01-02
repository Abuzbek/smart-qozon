import { storage } from "@/lib/supabase";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface Recipe {
  name_original: string;
  name_uz: string;
  name_en?: string;
  name_ru?: string;
  match_rate?: number;
  porsion?: string | number;
  difficulty?: string;
  cooking_time?: string;
  cuisine_type?: string;
  calories?: string;
  ingredients?: RecipeIngredient[];
  missing_ingredients?: string[];
  steps?: string[];
}

interface RecipeState {
  recentRecipes: Recipe[];
  savedRecipes: Recipe[];
  history: Recipe[];
  addRecentRecipes: (recipes: Recipe[]) => void;
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (recipe: Recipe) => void;
  isRecipeSaved: (recipe: Recipe) => boolean;
  addToHistory: (recipe: Recipe) => void;
}

const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

const getRecipeId = (r: Recipe) => `${r.name_uz}_${r.name_original || ""}`;

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recentRecipes: [],
      savedRecipes: [],
      history: [],
      addRecentRecipes: (newRecipes) => {
        set((state) => {
          // Add new recipes to the beginning of the list
          const updated = [...newRecipes, ...state.recentRecipes];
          // Keep only unique ones (by name_uz + name_original to be safe?)
          // Simplified unique check (JSON stringify or name check)
          // Let's assume name_uz is unique enough for now or just allow duplicates if generated again?
          // User said "store incoming reciepe".
          // Let's just limit to 50.
          return { recentRecipes: updated.slice(0, 50) };
        });
      },
      saveRecipe: (recipe) => {
        set((state) => {
          const id = getRecipeId(recipe);
          if (state.savedRecipes.some((r) => getRecipeId(r) === id)) {
            return state;
          }
          return { savedRecipes: [recipe, ...state.savedRecipes] };
        });
      },
      removeSavedRecipe: (recipe) => {
        set((state) => ({
          savedRecipes: state.savedRecipes.filter(
            (r) => getRecipeId(r) !== getRecipeId(recipe)
          ),
        }));
      },
      isRecipeSaved: (recipe) => {
        const id = getRecipeId(recipe);
        return get().savedRecipes.some((r) => getRecipeId(r) === id);
      },
      addToHistory: (recipe) => {
        set((state) => {
          const id = getRecipeId(recipe);
          // Avoid immediate duplicates at the top
          if (
            state.history.length > 0 &&
            getRecipeId(state.history[0]) === id
          ) {
            return state;
          }
          // Filter out previous instances to bump to top? Or just straight list?
          // "Record all recipes" - usually implies a proper history log.
          // Moving to top is better UX.
          const filtered = state.history.filter((r) => getRecipeId(r) !== id);
          return { history: [recipe, ...filtered].slice(0, 100) };
        });
      },
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
