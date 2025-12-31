import { getUserDevice } from "@/lib/userSync";
import { IngredientsService } from "@/services/IngredientsService";
import { useIngredientsStore } from "@/store/ingredientsStore";
import { useUserStore } from "@/store/userStore";
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [loaded, error] = useFonts({
    Fredoka_Regular: Fredoka_400Regular,
    Fredoka_Medium: Fredoka_500Medium,
    Fredoka_SemiBold: Fredoka_600SemiBold,
    Fredoka_Bold: Fredoka_700Bold,
  });

  useEffect(() => {
    const initApp = async () => {
      const deviceId = useUserStore.getState().deviceId;
      try {
        if (!deviceId) {
          setTimeout(() => {
            router.replace("/login" as any);
          }, 0);
          return;
        }
        // Run silently in background
        await getUserDevice(deviceId);

        // Checklist
        const isLoggedIn = useUserStore.getState().isLoggedIn;

        // Sync Ingredients
        syncIngredients();

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
        if (loaded || error) {
          SplashScreen.hideAsync();
        }
      }
    };

    const syncIngredients = async () => {
      try {
        const { getIngredientsCount, getIngredients } = IngredientsService;
        const { totalCount, setIngredients, setLoading } =
          useIngredientsStore.getState();

        // 1. Check Remote Count
        const remoteCount = await getIngredientsCount();

        // 2. Compare with Local Count
        // We sync if counts mismatch or if we have 0 ingredients locally (first run)
        if (remoteCount !== totalCount || totalCount === 0) {
          console.log(
            `Syncing Ingredients... Local: ${totalCount}, Remote: ${remoteCount}`
          );
          setLoading(true);
          const list = await getIngredients();
          setIngredients(list);
        } else {
          console.log("Ingredients up to date.");
        }
      } catch (e) {
        console.error("Ingredients Sync Failed:", e);
      } finally {
        useIngredientsStore.getState().setLoading(false);
      }
    };

    initApp();
  }, [loaded, error]);

  if (!isReady && !(loaded || error)) {
    return null; // Or a custom splash view
  }

  return (
    <KeyboardProvider>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
      </Stack>
    </KeyboardProvider>
  );
}
