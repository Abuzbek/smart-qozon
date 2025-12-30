import { syncUserDevice } from "@/lib/userSync";
import { useUserStore } from "@/store/userStore";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Run silently in background
        await syncUserDevice();

        // Checklist
        const isLoggedIn = useUserStore.getState().isLoggedIn;

        if (!isLoggedIn) {
          // We need to wait a tick for navigation to be ready
          setTimeout(() => {
            router.replace("/login" as any);
          }, 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  if (!isReady) {
    return null; // Or a custom splash view
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}
