import React from "react";
import { Platform, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// Use TestID for development, Real ID for production
const adUnitId = Platform.select({
  android: process.env.EXPO_PUBLIC_AD_ANDROID_APP_ID,
  ios: process.env.EXPO_PUBLIC_AD_IOS_APP_ID,
});

export const AdBanner = () => {
  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      <BannerAd
        unitId={adUnitId || TestIds.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};
