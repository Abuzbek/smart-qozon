import React, { createContext, useContext, useEffect, useState } from "react";

interface TelegramContextType {
  webApp: any;
  user: any;
  isFromTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(
  undefined
);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<any>(null);
  const [isFromTelegram, setIsFromTelegram] = useState(false);

  useEffect(() => {
    const loadTelegramSDK = async () => {
      // 1. Check if we are running in a browser environment
      if (typeof window !== "undefined") {
        try {
          // 2. Dynamically import the SDK here
          // @ts-ignore
          const TWA = (await import("@twa-dev/sdk")).default;

          // 3. Initialize
          TWA.ready();
          setWebApp(TWA);
          if (TWA.initData) {
            setIsFromTelegram(true);
          }
        } catch (e) {
          console.log("Failed to load Telegram SDK:", e);
        }
      }
    };

    loadTelegramSDK();
  }, []);

  const value = {
    webApp,
    user: webApp?.initDataUnsafe?.user,
    isFromTelegram,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};
