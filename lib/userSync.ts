import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export const syncUserDevice = async (phoneNumber: string | null = null) => {
  try {
    // 1. Get Unique Device ID
    let deviceId = "unknown";
    if (Platform.OS === "android") {
      deviceId = Application.getAndroidId() || "android_unknown";
    } else {
      deviceId = (await Application.getIosIdForVendorAsync()) || "ios_unknown";
    }

    // 2. Get Model Name
    const modelName = Device.modelName || "Unknown Device";

    // 3. Prepare Data
    const userData: any = {
      device_id: deviceId,
      device_model: modelName,
      platform: Platform.OS,
      last_seen_at: new Date().toISOString(),
    };

    // Only update phone number if we actually have one
    if (phoneNumber) {
      userData.phone_number = phoneNumber;
    }

    // 4. Send to Supabase
    const { error } = await supabase
      .from("app_users")
      .upsert(userData, { onConflict: "id" });
    if (error) {
      console.error("User Sync Error:", error.message);
    } else {
      // console.log("User Synced:", modelName);
    }

    return { deviceId, modelName };
  } catch (e) {
    console.error("Sync Failed:", e);
    return null;
  }
};
export const getUserDevice = async (deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("device_id", deviceId);
    if (error) {
      console.error("User Sync Error:", error.message);
    }
    return data;
  } catch (e) {
    console.error("Sync Failed:", e);
    return null;
  }
};
