import { Colors } from "@/constants/Colors";
import { GroupedIngredients } from "@/services/IngredientsService";
import { useIngredientsStore } from "@/store/ingredientsStore";
import { Check, Plus, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDebounce } from "use-debounce";
import { Input } from "./Input";

// Helper for Trigram Similarity (similar to pg_trgm)
function getTrigrams(str: string): Set<string> {
  const trigrams = new Set<string>();
  const padded = "  " + str.toLowerCase() + "  ";
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.substring(i, i + 3));
  }
  return trigrams;
}

function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const t1 = getTrigrams(str1);
  const t2 = getTrigrams(str2);

  if (t1.size === 0 || t2.size === 0) return 0;

  let intersection = 0;
  t1.forEach((gram) => {
    if (t2.has(gram)) intersection++;
  });

  return (2 * intersection) / (t1.size + t2.size);
}

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onToggle: (ingredient: string) => void;
}

export function IngredientSelector({
  selectedIngredients,
  onToggle,
}: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Debounce search query by 300ms
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const { ingredients, loading } = useIngredientsStore();

  const renderCheckbox = (isSelected: boolean) => (
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <Check size={12} color={Colors.light.background} />}
    </View>
  );

  const filteredGroups = React.useMemo(() => {
    const grouped: GroupedIngredients = {};
    if (!ingredients || !Array.isArray(ingredients)) return grouped;

    // Group all ingredients first if no search
    if (!debouncedSearchQuery) {
      ingredients.forEach((ing) => {
        const catKey = String(ing.category_uz || "Boshqa");
        if (!grouped[catKey]) grouped[catKey] = [];
        grouped[catKey].push(ing);
      });
      return grouped;
    }

    // Fuzzy Search Filter
    ingredients.forEach((ing) => {
      const name = ing.name_uz || ing.name || "";
      // Calculate match
      const similarity = calculateSimilarity(name, debouncedSearchQuery);

      // Threshold > 0.2 (adjustable) or includes check
      // Also check if category matches the search query
      const catKey = String(ing.category_uz || "Boshqa");

      if (
        similarity >= 0.2 ||
        name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        catKey.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      ) {
        if (!grouped[catKey]) grouped[catKey] = [];
        grouped[catKey].push(ing);
      }
    });

    return grouped;
  }, [ingredients, debouncedSearchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          containerStyle={{ marginBottom: 8, flexGrow: 1 }}
          placeholder="Masalliqlar izlash"
          leftIcon={<Search size={20} color={Colors.light.text} />}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.text}
        />
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={Colors.light.background} />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {Object.keys(filteredGroups).length === 0 ? (
        <Text style={styles.emptyText}>Masalliqlar topilmadi</Text>
      ) : (
        <View style={styles.listContainer}>
          {Object.entries(filteredGroups).map(([category, ingredients]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.ingredientsList}>
                {ingredients.map((ing) => {
                  const displayName = ing.name_uz || ing.name;
                  const isSelected = selectedIngredients.includes(displayName);

                  return (
                    <TouchableOpacity
                      key={ing.id}
                      style={styles.ingredientRow}
                      onPress={() => onToggle(displayName)}
                      activeOpacity={0.7}
                    >
                      {renderCheckbox(isSelected)}
                      <Text style={styles.ingredientText}>{displayName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  searchContainer: {
    marginBottom: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end", // Align input and button
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 50, // Match typical input height
    marginBottom: 8, // align with input bottom margin if any
  },
  addButtonText: {
    color: Colors.light.background,
    fontFamily: "Fredoka_Medium",
    fontSize: 14,
  },
  listContainer: {
    gap: 24,
  },
  categorySection: {
    gap: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  ingredientText: {
    fontSize: 16,
    fontFamily: "Fredoka_Medium",
    color: Colors.light.text,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.light.text,
    fontFamily: "Fredoka_Regular",
    marginTop: 20,
  },
});
