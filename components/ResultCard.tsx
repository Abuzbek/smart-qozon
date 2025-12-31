import { Colors } from "@/constants/Colors";
import { Recipe } from "@/store/recipeStore";
import { Clock, Flame, Globe } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ResultCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const DifficultyBadge = ({ level }: { level: string }) => {
  const color =
    level === "1" || level === "2"
      ? "#4CAF50"
      : level === "3"
      ? "#FFC107"
      : "#F44336";
  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.badgeText, { color }]}>
        {level === "1" || level === "2"
          ? "Oson"
          : level === "3"
          ? "O'rta"
          : "Qiyin"}
      </Text>
    </View>
  );
};

export function ResultCard({ recipe, onPress }: ResultCardProps) {
  const matchColor =
    recipe?.match_rate && recipe?.match_rate >= 80
      ? "#4CAF50"
      : recipe?.match_rate && recipe?.match_rate >= 50
      ? "#FFC107"
      : "#F44336";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <View style={styles.matchContainer}>
          <Text style={[styles.matchScore, { color: matchColor }]}>
            {recipe.match_rate}%
          </Text>
          <Text style={styles.matchLabel}>Moslik</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.name_uz}
          </Text>
          <Text style={styles.subtitle}>{recipe.name_original}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Clock size={16} color={Colors.light.text} />
          <Text style={styles.metaText}>{recipe.cooking_time}</Text>
        </View>
        <View style={styles.metaItem}>
          <Flame size={16} color={Colors.light.primary} />
          <Text style={styles.metaText}>{recipe.calories}</Text>
        </View>
        <View style={styles.metaItem}>
          <Globe size={16} color={Colors.light.tint} />
          <Text style={styles.metaText}>{recipe.cuisine_type}</Text>
        </View>
        <DifficultyBadge level={recipe?.difficulty || "1"} />
      </View>

      {recipe?.missing_ingredients &&
        recipe?.missing_ingredients?.length > 0 && (
          <View style={styles.missingContainer}>
            <Text style={styles.missingLabel}>Yetishmovchilik:</Text>
            <Text style={styles.missingText} numberOfLines={1}>
              {recipe.missing_ingredients.join(", ")}
            </Text>
          </View>
        )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 14,
    minWidth: 60,
  },
  matchScore: {
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
  },
  matchLabel: {
    fontSize: 10,
    fontFamily: "Fredoka_Regular",
    color: "#888",
  },
  title: {
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Fredoka_Regular",
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Fredoka_Medium",
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Fredoka_Bold",
  },
  missingContainer: {
    backgroundColor: "#FFF4E5",
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  missingLabel: {
    fontSize: 12,
    fontFamily: "Fredoka_Bold",
    color: "#FF9800",
  },
  missingText: {
    fontSize: 12,
    fontFamily: "Fredoka_Regular",
    color: "#663C00",
    flex: 1,
  },
});
