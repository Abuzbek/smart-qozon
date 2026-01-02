import { Heart } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Heart size={64} color="#ccc" />
      <Text style={styles.text}>Hali hech narsa yo'q</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
  },
});
