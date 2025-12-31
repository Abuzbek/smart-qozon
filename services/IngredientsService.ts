import { supabase } from "../lib/supabase";

// 1. Define the Shape of your Data
export interface Ingredient {
  id: number;
  name: string; // Internal/Fallback name
  name_en: string;
  name_uz: string;
  name_ru: string;
  image: string | null;
  category: string | null;
  category_uz: number;
  category_en: number;
  category_ru: number;
  is_verified: boolean;
}

// Helper Type for Grouped Data
export interface GroupedIngredients {
  [category: string]: Ingredient[];
}

export const IngredientsService = {
  /**
   * 1. GET LIST: Fetch all ingredients (optional: Search by name)
   * Useful for the search bar.
   */
  async getIngredients(searchQuery: string = "") {
    let query = supabase
      .from("ingredients")
      .select("*")
      .order("name_en", { ascending: true }); // Alphabetical order

    if (searchQuery) {
      // Search in ALL languages
      query = query.or(
        `name_en.ilike.%${searchQuery}%,name_uz.ilike.%${searchQuery}%,name_ru.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Ingredient[];
  },

  /**
   * 2. ADD: Insert a new ingredient (User custom input)
   * This is sent as 'is_verified: false' so you can check it later.
   */
  async addIngredient(name: string, category: string = "Other") {
    // We assume the user input is the "Uzbek" name by default for now,
    // or you can put it in 'name' (fallback).
    const { data, error } = await supabase
      .from("ingredients")
      .insert([
        {
          name: name, // Fallback ID
          name_uz: name, // Assume user types in their language
          name_en: name, // Temp fill to satisfy unique constraint
          category: category,
          is_verified: false, // Pending admin approval
          image: null, // No image for custom user items yet
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Ingredient;
  },

  /**
   * 3. GET UNIQUE CATEGORIES: Returns a list of categories ['Meat', 'Dairy', ...]
   */
  async getCategories() {
    const { data, error } = await supabase
      .from("ingredients")
      .select("category");

    if (error) throw error;

    // Filter out nulls and duplicates using Set
    const uniqueCategories = [
      ...new Set(data.map((item) => item.category).filter((c) => c !== null)),
    ] as string[];

    return uniqueCategories.sort();
  },

  /**
   * 4. GET GROUPED: Returns { "Meat": [...], "Dairy": [...] }
   * Perfect for your "Grocery List" or "Explore" screen.
   */
  async getIngredientsGrouped() {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("category_uz", { ascending: true });

    if (error) throw error;

    const ingredients = data as Ingredient[];

    // Grouping Logic (JavaScript Reduce)
    const grouped = ingredients.reduce((acc, item) => {
      const cat = item.category_uz || "Other"; // Fallback if category is missing
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {} as GroupedIngredients);
    return grouped;
  },
  /**
   * Search for ingredients by name in EN, RU, or UZ.
   * @param query - The text to search for (e.g. "tovuq" or "app")
   */
  async searchIngredients(query: string) {
    if (!query) return [];

    // OLD WAY (Exact match only):
    // .or(`name_uz.ilike.%${query}%`) ...

    // NEW WAY (Smart Fuzzy Search):
    const { data, error } = await supabase.rpc("search_ingredients_fuzzy", {
      search_term: query,
    });

    if (error) {
      console.error("Search Error:", error);
      throw error;
    }

    return data as Ingredient[];
  },

  async getIngredientsCount() {
    const { count, error } = await supabase
      .from("ingredients")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },
};
