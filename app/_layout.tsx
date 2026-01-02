import { TelegramProvider } from "@/context/TelegramContext";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <TelegramProvider>
      <KeyboardProvider>
        <Stack>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </KeyboardProvider>
    </TelegramProvider>
  );
}
