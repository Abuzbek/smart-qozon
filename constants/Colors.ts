const tintColorLight = "#2E7D32";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#333333",
    background: "#F5F5F5",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    // For MVP, we might want to stick to the light theme primarily as requested (Fresh Green/White)
    // But setting reasonable dark defaults.
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
