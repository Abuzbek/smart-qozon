import { Colors } from "@/constants/Colors";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COMMON_INGREDIENTS = [
  "Kartoshka",
  "Piyoz",
  "Sabzi",
  "Go'sht",
  "Guruch",
  "Tuxum",
  "Pomidor",
  "Bodring",
  "Un",
  "Yog'",
  "Sut",
  "Qatiq",
  "Makaron",
  "Karam",
  "Sarimsoq",
  "Ko'katlar",
  "Tovuq",
  "Baliq",
  "No'xat",
  "Loviyasi",
  "Mosh",
  "Shakar",
  "Tuz",
  "Ziravorlar",
  "Non",
  "Saryog'",
  "Pishloq",
  "Kolbasa",
  "Sosiska",
  "Mayonez",
];

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onToggle: (ingredient: string) => void;
}

export function IngredientSelector({
  selectedIngredients,
  onToggle,
}: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredIngredients = COMMON_INGREDIENTS.filter((ing) =>
    ing.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Masalliqlar (kamida 3 ta tanlang):</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Masalliq qidirish..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.text}
        />
      </View>

      <View style={styles.grid}>
        {filteredIngredients.map((ing) => {
          const isSelected = selectedIngredients.includes(ing);
          return (
            <TouchableOpacity
              key={ing}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onToggle(ing)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {ing}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: Colors.light.background,
    fontWeight: "600",
  },
});
