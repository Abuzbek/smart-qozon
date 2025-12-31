import { storage } from "@/lib/supabase"; // Using same MMKV instance
import { Ingredient } from "@/services/IngredientsService";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

// Reuse the MMKV adapter logic
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

interface IngredientsState {
  ingredients: Ingredient[];
  totalCount: number;
  loading: boolean;
  setIngredients: (list: Ingredient[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useIngredientsStore = create<IngredientsState>()(
  persist(
    (set) => ({
      ingredients: [],
      totalCount: 0,
      loading: false,
      setIngredients: (list) => {
        set({ ingredients: list, totalCount: list.length });
      },
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "ingredients-storage-v2",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
