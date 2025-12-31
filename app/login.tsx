import transparentLogo from "@/assets/images/transparent_logo.png";
import { Input } from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { syncUserDevice } from "@/lib/userSync";
import { useUserStore } from "@/store/userStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("+998 ");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNextStep = () => {
    if (phone.length < 13) {
      Alert.alert("Xatolik", "Iltimos, to'g'ri telefon raqam kiriting");
      return;
    }
    setStep(2);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Sync user to backend
      const result = await syncUserDevice(phone);

      if (result) {
        // Update global store
        useUserStore.getState().setUserData({
          phone: phone,
          deviceModel: result.modelName,
          deviceId: result.deviceId,
        });

        useUserStore.getState().setFamily({
          adults,
          children,
        });
        // Go to home
        router.replace("/(tabs)");
      } else {
        throw new Error("Device sync failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Xatolik",
        "Tizimga kirishda xatolik yuz berdi" + JSON.stringify(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <View style={styles.counterContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(0, value - 1))}
          style={styles.counterButton}
        >
          <Minus size={20} color={Colors.light.tint} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          style={styles.counterButton}
        >
          <Plus size={20} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={[styles.content]}
          keyboardVerticalOffset={0}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.logo_container}>
            <Image
              source={transparentLogo}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Davom etish uchun telefon raqamingizni kiriting"
              : "Oilangiz haqida ma'lumot bering"}
          </Text>

          {step === 1 ? (
            <View style={styles.inputContainer}>
              <Input
                testID="phone-input"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                label="Telefon raqam"
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Counter label="Kattalar" value={adults} onChange={setAdults} />
              <Counter
                label="Bolalar"
                value={children}
                onChange={setChildren}
              />
            </View>
          )}

          <TouchableOpacity
            testID="login-button"
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 1 ? handleNextStep : handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Kirish..." : step === 1 ? "Keyingi qadam" : "Kirish"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo_container: {
    alignItems: "center",
    marginBottom: 16,
    height: 150,
  },
  logo: {
    width: "100%",
    objectFit: "contain",
    height: "100%",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: "Fredoka_Medium",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 100,
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
    color: Colors.light.background,
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.text,
  },
  counterLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: "Fredoka_Medium",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background, // Or a lighter shade if needed
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    minWidth: 24,
    textAlign: "center",
  },
});
