// components/AdBanner.web.tsx

// On Web, we simply return nothing (null) or a placeholder.
// AdMob Mobile SDKs DO NOT work on the web.
export const AdBanner = () => {
  return null;

  // OR if you want to verify it's working during development:
  // return (
  //   <View style={{ padding: 20, backgroundColor: '#f0f0f0', alignItems: 'center' }}>
  //     <Text style={{ color: '#888' }}>Ads are hidden on Web</Text>
  //   </View>
  // );
};
