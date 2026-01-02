import transparentLogo from "@/assets/images/transparent_logo.png";
import { Input } from "@/components/Input";
import { Colors } from "@/constants/Colors";
import { useTelegram } from "@/context/TelegramContext";
import { supabase } from "@/lib/supabase"; // Make sure you have this
import { syncUserDevice } from "@/lib/userSync";
import { useUserStore } from "@/store/userStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Minus, Plus } from "lucide-react-native";
import { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const { isFromTelegram, webApp } = useTelegram();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("+998 ");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [loading, setLoading] = useState(false);
  const [tgStatus, setTgStatus] = useState<"idle" | "waiting" | "success">(
    "idle"
  );
  const router = useRouter();

  // --- NEW: Handle Telegram Login Logic ---
  useEffect(() => {
    if (!isFromTelegram || !webApp?.initDataUnsafe?.user) return;

    const tgUser = webApp.initDataUnsafe.user;

    const initTelegramUser = async () => {
      setLoading(true);

      // 1. Create/Get the user row immediately
      const { data: user, error } = await supabase
        .from("telegram_users")
        .upsert({
          id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase Error:", error);
        setLoading(false);
        return;
      }

      // 2. If phone already exists, Log in immediately!
      if (user?.phone_text) {
        completeLogin(user.phone_text, user.id);
        return;
      }

      // 3. If no phone, start listening for updates
      setLoading(false);

      const channel = supabase
        .channel(`login-${tgUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "telegram_users",
            filter: `id=eq.${tgUser.id}`,
          },
          (payload) => {
            const updatedUser = payload.new;
            if (updatedUser.phone_text) {
              completeLogin(updatedUser.phone_text, updatedUser.id);
              channel.unsubscribe();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    initTelegramUser();
  }, [isFromTelegram]);

  // Shared Helper to Finish Login
  const completeLogin = (phoneNumber: string, userId?: number) => {
    setTgStatus("success");
    setLoading(true);

    // Save to global store
    useUserStore.getState().setUserData({
      id: String(userId),
      phone: phoneNumber,
    });

    // Sync device in background
    syncUserDevice(phoneNumber);

    // Redirect
    setTimeout(() => {
      router.replace("/(app)/(tabs)");
    }, 500);
  };

  const handleRequestPhone = async () => {
    if (!webApp) return;
    const user = webApp.initDataUnsafe?.user;
    if (!user) return;

    setTgStatus("waiting"); // Show "Check your chat" message

    try {
      await fetch(process.env.EXPO_PUBLIC_WEB_APP_URL + "/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_id: Date.now(),
          message: {
            message_id: Date.now(),
            from: {
              id: user.id,
              first_name: user.first_name,
              username: user.username,
            },
            chat: { id: user.id, type: "private" }, // Critical for reply
            web_app_data: { data: "REQUEST_PHONE" },
          },
        }),
      });

      // DO NOT close webApp immediately.
      // Let the user see the "Check Chat" message.
      // webApp.close();
    } catch (e) {
      Alert.alert("Error", "Failed to connect to bot.");
      setTgStatus("idle");
    }
  };

  // --- Existing Logic for Regular Users ---
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
      const cleanPhone = phone.replace(/\s/g, "");
      if (cleanPhone.length < 13) {
        Alert.alert("Xatolik", "Iltimos, to'g'ri raqam kiriting");
        setLoading(false);
        return;
      }

      useUserStore.getState().setFamily({ adults, children });
      completeLogin(phone);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // ... (Keep your Counter Component and other logic same)
  const Counter = ({ label, value, onChange }: any) => (
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

  const DismissKeyboardWrapper =
    Platform.OS === "web" ? Fragment : TouchableWithoutFeedback;
  const dismissKeyboardProps =
    Platform.OS === "web" ? {} : { onPress: Keyboard.dismiss };

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardWrapper {...dismissKeyboardProps}>
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
            isFromTelegram ? (
              <View style={styles.inputContainer}>
                {tgStatus === "waiting" ? (
                  <View style={styles.waitingContainer}>
                    <ActivityIndicator color={Colors.light.tint} />
                    <Text style={styles.waitingText}>
                      Botga xabar yuborildi!
                    </Text>
                    <Text style={styles.waitingSubText}>
                      Chatga qaytib "Share Contact" tugmasini bosing.
                    </Text>
                    <TouchableOpacity
                      onPress={() => webApp?.close()}
                      style={styles.linkBtn}
                    >
                      <Text style={styles.linkText}>Chatga qaytish ↗</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleRequestPhone}
                  >
                    <Text style={styles.buttonText}>
                      Telefon raqamni ulashish 📱
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Input
                  testID="phone-input"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  label="Telefon raqam"
                />
              </View>
            )
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

          {!isFromTelegram && (
            <TouchableOpacity
              testID="login-button"
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={step === 1 ? handleNextStep : handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Kirish..."
                  : step === 1
                  ? "Keyingi qadam"
                  : "Kirish"}
              </Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </DismissKeyboardWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Your existing styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  logo_container: { alignItems: "center", marginBottom: 16, height: 150 },
  logo: { width: "100%", objectFit: "contain", height: "100%" },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: "Fredoka_Medium",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: { marginBottom: 24 },
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
  buttonDisabled: { opacity: 0.7 },
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
  counterControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
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

  // New Styles for the Waiting Screen
  waitingContainer: { alignItems: "center", padding: 20 },
  waitingText: {
    fontSize: 18,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.tint,
    marginTop: 10,
  },
  waitingSubText: { textAlign: "center", marginTop: 5, color: "#666" },
  linkBtn: { marginTop: 15 },
  linkText: {
    color: Colors.light.tint,
    textDecorationLine: "underline",
    fontFamily: "Fredoka_Medium",
  },
});
