import { Platform } from "react-native";

export const useTelegram = () => {
  // 1. If running on Android/iOS Native, return null (Safety)
  if (Platform.OS !== "web") {
    return { user: null, webApp: null };
  }

  // 2. If on Web, access the global Telegram object safely
  // @ts-ignore (Because 'window.Telegram' only exists in browser)
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

  // 3. Initialize
  if (webApp) {
    webApp.ready();
    webApp.expand(); // Make it full screen
  }

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user,
  };
};
