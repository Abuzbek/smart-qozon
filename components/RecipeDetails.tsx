import { Colors } from "@/constants/Colors";
import { Recipe, useRecipeStore } from "@/store/recipeStore";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Flame,
  Globe,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RecipeDetailsProps {
  recipe: Recipe;
  onBack: () => void;
}

export function RecipeDetails({ recipe, onBack }: RecipeDetailsProps) {
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useRecipeStore();
  const saved = isRecipeSaved(recipe);

  const handleSave = () => {
    if (saved) {
      removeSavedRecipe(recipe);
    } else {
      saveRecipe(recipe);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name_uz}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Bookmark
            size={24}
            color={saved ? Colors.light.tint : Colors.light.text}
            fill={saved ? Colors.light.tint : "none"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{recipe?.name_uz || "Nomlanmagan"}</Text>
        <Text style={styles.subtitle}>{recipe?.name_original || ""}</Text>

        {/* Meta Data */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={16} color={Colors.light.text} />
            <Text style={styles.metaText}>{recipe?.cooking_time || "-"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={16} color={Colors.light.text} />
            <Text style={styles.metaText}>{recipe?.porsion || 2} kishilik</Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={16} color={Colors.light.primary} />
            <Text style={styles.metaText}>{recipe?.calories || "-"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Globe size={16} color={Colors.light.tint} />
            <Text style={styles.metaText}>{recipe?.cuisine_type || "-"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Kerakli masalliqlar:</Text>
        <View style={styles.ingredientsContainer}>
          {recipe.ingredients?.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientAmount}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        {recipe?.missing_ingredients &&
          recipe?.missing_ingredients?.length > 0 && (
            <View style={styles.missingBox}>
              <Text style={styles.missingTitle}>Sizda yo'q masalliqlar:</Text>
              {recipe?.missing_ingredients?.map((item, idx) => (
                <Text key={idx} style={styles.missingItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

        <View style={styles.divider} />

        {/* Steps */}
        <Text style={styles.sectionTitle}>Tayyorlanishi:</Text>
        <View style={styles.stepsContainer}>
          {recipe?.steps?.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  saveButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Fredoka_Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 14,
    fontFamily: "Fredoka_Medium",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  ingredientsContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.tint,
    marginRight: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Fredoka_Regular",
    color: Colors.light.text,
  },
  ingredientAmount: {
    fontSize: 16,
    fontFamily: "Fredoka_Medium",
    color: Colors.light.text,
  },
  missingBox: {
    marginTop: 16,
    backgroundColor: "#FFF4E5",
    padding: 16,
    borderRadius: 16,
  },
  missingTitle: {
    fontSize: 16,
    fontFamily: "Fredoka_Bold",
    color: "#D84315",
    marginBottom: 8,
  },
  missingItem: {
    fontSize: 15,
    fontFamily: "Fredoka_Regular",
    color: "#D84315",
    marginBottom: 4,
  },
  stepsContainer: {},
  stepRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#FFF",
    fontFamily: "Fredoka_Bold",
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Fredoka_Regular",
    color: Colors.light.text,
  },
});
