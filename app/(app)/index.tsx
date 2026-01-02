import transparentLogo from "@/assets/images/transparent_logo.png";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        {/* Placeholder for Logo if exists, otherwise text */}
        <View style={styles.logoContainer}>
          <Image
            source={transparentLogo}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>"Pishir"ga hush kelibsiz!</Text>
        <Text style={styles.subtitle}>Sizning Aqlli oshxona hamrohingiz!</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Qani kettik</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    height: 150,
    marginBottom: 40,
    gap: 10,
    width: "100%",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoText: {
    fontSize: 48,
    fontFamily: "Fredoka_Bold", // Assuming Fredoka is loaded based on _layout.tsx
    color: Colors.light.text,
  },
  title: {
    fontSize: 32,
    fontFamily: "Fredoka_Bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Fredoka_Medium",
    color: Colors.light.text,
    textAlign: "center",
    opacity: 0.8,
  },
  footer: {
    paddingVertical: 32,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Fredoka_SemiBold",
  },
});
