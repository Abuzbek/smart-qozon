import { getDeviceId } from "@/utils/getDeviceId";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export const syncUserDevice = async (phoneNumber: string) => {
  try {
    // 1. Prepare User Data
    // We remove spaces so "+998 90" and "+99890" are treated as the same user
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    const deviceId = await getDeviceId();
    const modelName = Device.modelName || "Unknown Device";

    const userData = {
      phone_number: cleanPhone, // This is now our "Key"
      device_id: deviceId, // Update to current device
      device_model: modelName, // Update to current model
      platform: Platform.OS,
      last_seen_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("app_users")
      .upsert(userData, {
        onConflict: "phone_number",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    return data;
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
