import * as Application from "expo-application";
import { Platform } from "react-native";

/**
 * Returns a unique ID for the device.
 * - Native: Uses real hardware ID.
 * - Web: Generates a random ID and stores it in LocalStorage.
 */
export const getDeviceId = async (): Promise<string> => {
  // 1. HANDLE WEB (The Fix)
  if (Platform.OS === "web") {
    // Check if we already have a generated ID in the browser
    let webId = localStorage.getItem("aqlli_qozon_device_id");

    if (!webId) {
      // If not, generate a new one (Simple UUID-like string)
      webId =
        "web-" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("aqlli_qozon_device_id", webId);
    }

    return webId;
  }

  // 2. HANDLE ANDROID
  if (Platform.OS === "android") {
    return Application.getAndroidId() || "unknown-android-id";
  }

  // 3. HANDLE IOS
  if (Platform.OS === "ios") {
    const iosId = await Application.getIosIdForVendorAsync();
    return iosId || "unknown-ios-id";
  }

  return "unknown-device";
};
