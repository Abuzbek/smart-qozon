import { Colors } from "@/constants/Colors";
import { storage } from "@/lib/supabase"; // Access MMKV
import { syncUserDevice } from "@/lib/userSync";
import { useRouter } from "expo-router";
import { ChefHat } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("+998 ");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (phone.length < 13) {
      // Simple validation for +998...
      Alert.alert("Xatolik", "Iltimos, to'g'ri telefon raqam kiriting");
      return;
    }

    setLoading(true);
    try {
      // Sync user to backend
      await syncUserDevice(phone);

      // Save locally marker that user is logged in
      storage.set("is_logged_in", true);
      storage.set("user_phone", phone);

      // Go to home
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
      Alert.alert("Xatolik", "Tizimga kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ChefHat size={64} color={Colors.light.tint} />
        </View>
        <Text style={styles.title}>Aqlli Qozon</Text>
        <Text style={styles.subtitle}>
          Davom etish uchun telefon raqamingizni kiriting
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefon raqam</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholder="+998 90 123 45 67"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Kirish..." : "Kirish"}
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#333",
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
