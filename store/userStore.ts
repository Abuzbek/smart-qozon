import { storage } from "@/lib/supabase";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

// Zustand adapter for MMKV
const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

interface UserState {
  userPhone: string | null;
  deviceModel: string | null;
  deviceId: string | null;
  id: string | null;
  isLoggedIn: boolean;
  setUserData: (data: {
    phone?: string;
    deviceModel?: string;
    deviceId?: string;
    id?: string;
  }) => void;
  logout: () => void;
  setFamily: (family: { adults: number; children: number }) => void;
  family: {
    adults: number;
    children: number;
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userPhone: null,
      id: null,
      deviceModel: null,
      deviceId: null,
      isLoggedIn: false,
      family: {
        adults: 0,
        children: 0,
      },
      setUserData: (data) =>
        set({
          userPhone: data.phone,
          id: data.id,
          deviceModel: data.deviceModel,
          deviceId: data.deviceId,
          isLoggedIn: true,
        }),
      setFamily: (family: { adults: number; children: number }) =>
        set({
          family,
        }),
      logout: () =>
        set({
          userPhone: null,
          id: null,
          deviceModel: null,
          deviceId: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "user-storage-zustand",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
