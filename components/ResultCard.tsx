import { Colors } from "@/constants/Colors";
import { Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface Recipe {
  name_uz: string;
  cooking_time: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  servings?: string;
}

interface ResultCardProps {
  recipe: Recipe;
}

export function ResultCard({ recipe }: ResultCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{recipe.name_uz}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock size={16} color="#666" />
          <Text style={styles.metaText}>{recipe.cooking_time}</Text>
        </View>
      </View>

      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Kerakli masalliqlar:</Text>
      {recipe.ingredients.map((ing, idx) => (
        <View key={idx} style={styles.ingredientRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.ingredientName}>{ing.name}</Text>
          <Text style={styles.ingredientAmount}>{ing.amount}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Tayyorlanishi:</Text>
      {recipe.steps.map((step, idx) => (
        <View key={idx} style={styles.stepRow}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{idx + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.tint,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  bullet: {
    color: Colors.light.tint,
    fontSize: 18,
    marginRight: 8,
  },
  ingredientName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
});
