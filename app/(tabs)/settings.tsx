import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { getDeviceId } from "@/utils/getDeviceId";
import { Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);

  useEffect(() => {
    const userPhone = useUserStore.getState().userPhone;
    const familyProfile = useUserStore.getState().family;
    setAdults(familyProfile?.adults || 2);
    setChildren(familyProfile?.children || 2);
    setPhone(userPhone || "+998 ");
  }, []);

  const setFamilyProfile = (newAdults?: number, newChildren?: number) => {
    const familyProfile = useUserStore.getState().family;
    const updatedAdults =
      newAdults !== undefined ? newAdults : familyProfile?.adults || 2;
    const updatedChildren =
      newChildren !== undefined ? newChildren : familyProfile?.children || 2;

    useUserStore.setState({
      family: {
        adults: updatedAdults,
        children: updatedChildren,
      },
    });
    setAdults(updatedAdults);
    setChildren(updatedChildren);
  };

  const handleFeedbackSubmit = async () => {
    if (!message) {
      Alert.alert("Xatolik", "Iltimos, xabarni kiriting");
      return;
    }
    setLoading(true);
    try {
      // ✅ Works on iOS, Android, AND Web
      const deviceId = await getDeviceId();

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Sozlamalar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oilaviy holat</Text>
        <View style={styles.column}>
          <Counter
            label="Kattalar"
            value={adults}
            onChange={(val) => setFamilyProfile(val, children)}
          />
          <Counter
            label="Bolalar"
            value={children}
            onChange={(val) => setFamilyProfile(adults, val)}
          />
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
  column: {
    flexDirection: "column",
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: "#EEE",
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
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  counterLabel: {
    fontSize: 16,
    color: Colors.light.text,
    // fontFamily: "Fredoka_Medium", // Add if available globally or import fonts
    fontWeight: "500",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 18,
    // fontFamily: "Fredoka_Bold",
    fontWeight: "bold",
    color: Colors.light.text,
    minWidth: 24,
    textAlign: "center",
  },
});
