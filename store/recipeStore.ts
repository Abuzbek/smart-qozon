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
  addRecentRecipes: (recipes: Recipe[]) => void;
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (recipe: Recipe) => void;
  isRecipeSaved: (recipe: Recipe) => boolean;
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

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recentRecipes: [],
      savedRecipes: [],
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
          if (state.savedRecipes.some((r) => r.name_uz === recipe.name_uz)) {
            return state;
          }
          return { savedRecipes: [recipe, ...state.savedRecipes] };
        });
      },
      removeSavedRecipe: (recipe) => {
        set((state) => ({
          savedRecipes: state.savedRecipes.filter(
            (r) => r.name_uz !== recipe.name_uz
          ),
        }));
      },
      isRecipeSaved: (recipe) => {
        return get().savedRecipes.some((r) => r.name_uz === recipe.name_uz);
      },
    }),
    {
      name: "recipe-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
