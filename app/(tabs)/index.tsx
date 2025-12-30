import { IngredientSelector } from "@/components/IngredientSelector";
import { Recipe, ResultCard } from "@/components/ResultCard";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { ArrowLeft, ChefHat, RotateCcw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_RECIPE: Recipe[] = [
  {
    name_uz: "Tuxum va Kartoshkali Qovurma",
    cooking_time: "25 daqiqa",
    description:
      "Tez va to'yimli nonushta yoki kechki ovqat uchun ajoyib tanlov. Bor masalliqlar bilan oson tayyorlanadi.",
    ingredients: [
      { name: "Kartoshka", amount: "3 dona" },
      { name: "Tuxum", amount: "4 dona" },
      { name: "Piyoz", amount: "1 dona" },
      { name: "Yog'", amount: "50 ml" },
      { name: "Tuz", amount: "ta'bga ko'ra" },
    ],
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
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

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
      // Mock logic for daily limit: allow always

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "generate-recipe",
        {
          body: {
            ingredients: selectedIngredients,
            familyConfig: {
              adults: familyProfile?.adults || 2,
              children: familyProfile?.children || 2,
            },
          },
        }
      );

      if (error) {
        console.warn("Edge function error, falling back to mock:", error);
        // Fallback to mock for MVP if backend isn't ready
        setTimeout(() => {
          setRecipes(MOCK_RECIPE);
          setLoading(false);
        }, 2000);
      } else {
        console.log("Edge function success:", data);
        setRecipes(data);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setTimeout(() => {
        setRecipes(MOCK_RECIPE);
        setLoading(false);
      }, 2000);
    }
  };

  const reset = () => {
    setRecipes(null);
    setSelectedIngredients([]);
  };

  if (loading) {
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

  if (recipes && recipes.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setRecipes(null)}
            style={styles.iconButton}
          >
            <ArrowLeft size={24} color="#333" />
            <Text style={styles.backText}>Orqaga</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          {recipes.map((recipe, index) => (
            <ResultCard key={index} recipe={recipe} />
          ))}
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <RotateCcw size={20} color="white" />
            <Text style={styles.resetButtonText}>Boshqasini izlash</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTitleContainer}>
          <ChefHat size={32} color={Colors.light.tint} />
          <Text style={styles.appTitle}>Smart Qozon</Text>
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
          <ChefHat size={24} color="white" style={{ marginRight: 8 }} />
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
    backgroundColor: "#F5F5F5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
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
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  fabDisabled: {
    backgroundColor: "#A5D6A7", // Light green
    elevation: 0,
  },
  fabText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
  resultScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#666",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: -10,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
