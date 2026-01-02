import transparentLogo from "@/assets/images/transparent_logo.png";
import { AdBanner } from "@/components/AdBanner";
import { IngredientSelector } from "@/components/IngredientSelector";
import { RecipeDetails } from "@/components/RecipeDetails";
import { ResultCard } from "@/components/ResultCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useIngredientsStore } from "@/store/ingredientsStore";
import { Recipe, useRecipeStore } from "@/store/recipeStore";
import { useUserStore } from "@/store/userStore";
import { getDeviceId } from "@/utils/getDeviceId";
import { Image } from "expo-image";
import { ArrowLeft, ChefHat, RotateCcw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_RECIPE: Recipe[] = [
  {
    name_original: "Potato and Egg Fry",
    name_uz: "Tuxum va Kartoshkali Qovurma",
    match_rate: 100,
    difficulty: "1",
    cooking_time: "25 daqiqa",
    cuisine_type: "O'zbek",
    calories: "350 kkal",
    porsion: "2",
    ingredients: [
      { name: "Kartoshka", amount: "3 dona" },
      { name: "Tuxum", amount: "4 dona" },
      { name: "Piyoz", amount: "1 dona" },
      { name: "Yog'", amount: "50 ml" },
    ],
    missing_ingredients: [],
    steps: [
      "Kartoshkani tozalab, mayda kubik shaklida to'g'rang.",
      "Piyozni yarim halqa qilib to'g'rang.",
      "Tovaga yog' solib qiziting, oldin kartoshkani qizarguncha qovuring.",
      "Piyozni qo'shib, yana 5 daqiqa qovuring.",
      "Tuxumlarni chaqib, ustidan quying va pishguncha dimlab qo'ying.",
      "Ta'bga ko'ra tuz va murch seping. Yoqimli ishtaha!",
    ],
  },
];

export default function HomeScreen() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Local state for current search results
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { loading: isSyncing } = useIngredientsStore();
  const { addRecentRecipes } = useRecipeStore();

  const toggleIngredient = (ing: string) => {
    if (selectedIngredients.includes(ing)) {
      setSelectedIngredients((prev) => prev.filter((i) => i !== ing));
    } else {
      setSelectedIngredients((prev) => [...prev, ing]);
    }
  };

  const handleFindRecipe = async () => {
    if (selectedIngredients.length < 3) {
      Alert.alert("Diqqat", "Iltimos, kamida 3 ta masalliq tanlang");
      return;
    }

    setLoading(true);
    try {
      const familyProfile = useUserStore.getState().family;
      const deviceId = await getDeviceId();

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "generate-recipe",
        {
          body: {
            ingredients: selectedIngredients,
            device_id: deviceId, // Pass device ID for rate limiting
            familyConfig: {
              adults: familyProfile?.adults || 2,
              children: familyProfile?.children || 2,
            },
          },
        }
      );

      console.log("Edge function response:", data);

      if (error) {
        console.warn("Edge function error, falling back to mock:", error);
        setTimeout(() => {
          setCurrentRecipes(MOCK_RECIPE);
          addRecentRecipes(MOCK_RECIPE);
          setLoading(false);
        }, 2000);
      } else {
        console.log("Edge function success:", data);
        if (Array.isArray(data)) {
          const newRecipes = data as Recipe[];
          setCurrentRecipes(newRecipes);
          addRecentRecipes(newRecipes);
        } else {
          console.warn("Expected array but got:", data);
          setCurrentRecipes([]);
        }
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        setCurrentRecipes(MOCK_RECIPE);
        addRecentRecipes(MOCK_RECIPE);
        setLoading(false);
      }, 2000);
    }
  };

  const reset = () => {
    setCurrentRecipes(null);
    setSelectedRecipe(null);
  };

  if (loading || isSyncing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Oshpaz o'ylayapti...</Text>
        <Text style={styles.loadingSubText}>
          Sizning masalliqlaringizga mos retsept qidirilmoqda
        </Text>
      </SafeAreaView>
    );
  }

  // Show Details View
  if (selectedRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <RecipeDetails
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
        />
      </SafeAreaView>
    );
  }

  // Show Results List
  if (currentRecipes && currentRecipes.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={reset} style={styles.iconButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
            <Text style={styles.backText}>Orqaga</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Text style={styles.resultTitle}>Topilgan Retseptlar</Text>
          {currentRecipes.map((recipe, index) => (
            <ResultCard
              key={index}
              recipe={recipe}
              onPress={() => setSelectedRecipe(recipe)}
            />
          ))}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleFindRecipe}
          >
            <RotateCcw size={20} color={Colors.light.background} />
            <Text style={styles.resetButtonText}>Qayta izlash</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
          <AdBanner />
        </View>
      </SafeAreaView>
    );
  }

  // Default Search View
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTitleContainer}>
          <Image
            source={transparentLogo}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <Text style={styles.subtitle}>
          Uyingizda bor masalliqlarni belgilang, biz sizga retsept topib
          beramiz!
        </Text>

        <IngredientSelector
          selectedIngredients={selectedIngredients}
          onToggle={toggleIngredient}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            selectedIngredients.length < 3 && styles.fabDisabled,
          ]}
          onPress={handleFindRecipe}
          disabled={loading}
          activeOpacity={0.8}
        >
          <ChefHat
            size={24}
            color={Colors.light.background}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.fabText}>
            Retsept Topish ({selectedIngredients.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.tint,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Fredoka_Regular",
    color: Colors.light.text,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
    height: 150,
    marginBottom: 24,
    gap: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Fredoka_Regular",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  fab: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  fabDisabled: {
    backgroundColor: Colors.light.primaryDisabled,
    elevation: 0,
  },
  fabText: {
    color: Colors.light.background,
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 4,
    fontFamily: "Fredoka_Medium",
  },
  resultScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.icon,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  resetButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontFamily: "Fredoka_Bold",
  },
});
