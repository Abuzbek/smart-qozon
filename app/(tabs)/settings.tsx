import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import * as Application from "expo-application";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Family Profile State (Mocked initially or local state)
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");

  useEffect(() => {
    const userPhone = useUserStore.getState().userPhone;
    const familyProfile = useUserStore.getState().family;
    setAdults(String(familyProfile?.adults) || "2");
    setChildren(String(familyProfile?.children) || "2");
    setPhone(userPhone || "+998 ");
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!message) {
      Alert.alert("Xatolik", "Iltimos, xabarni kiriting");
      return;
    }
    setLoading(true);
    try {
      let deviceId = "unknown";
      if (Platform.OS === "ios") {
        deviceId = (await Application.getIosIdForVendorAsync()) || "unknown";
      } else {
        deviceId = Application.getAndroidId() || "unknown";
      }

      const { error } = await supabase.from("feedbacks").insert({
        user_device_id: deviceId,
        message: message,
        phone_number: phone,
      });

      if (error) throw error;

      Alert.alert("Rahmat!", "Xabaringiz qabul qilindi.");
      setMessage("");
      setPhone("+998 ");
    } catch (e) {
      console.error(e);
      Alert.alert("Xatolik", "Xabar yuborishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Sozlamalar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oilaviy holat</Text>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kattalar</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={adults}
              onChangeText={setAdults}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bolalar</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={children}
              onChangeText={setChildren}
            />
          </View>
        </View>
      </View>
      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bizga Yozish</Text>
        <Text style={styles.label}>Telefon raqamingiz</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Xabar</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="Taklif yoki shikoyatingiz..."
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleFeedbackSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Yuborilmoqda..." : "Yuborish"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 24,
  },
  section: {
    backgroundColor: Colors.light.background,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE", // Consider updating if needed, else keep neutral
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    height: 100,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.primaryDisabled,
    // marginVertical: 16,
  },
});
