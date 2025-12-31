export const Colors = {
  light: {
    text: "#402C1C",
    background: "#F0E9DE",
    tint: "#F78938",
    icon: "#E63639",
    tabIconDefault: "#E63639",
    tabIconSelected: "#F78938",
    primary: "#F78938",
    primaryDisabled: "rgba(247, 136, 56, 0.5)",
    secondary: "#E63639",
    black: '#000',
    white: '#fff'
  },
  dark: {
    // For MVP, we might want to stick to the light theme primarily as requested
    // But setting reasonable dark defaults or keeping them same as light for now if precise dark mode isn't defined.
    // Given the specific earth/warm tones, a direct dark mode inversion might look odd without design.
    // I will keep the previous dark defaults but update tint to primary.
    text: "#ECEDEE",
    background: "#151718",
    tint: "#F78938",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#F78938",
    primary: "#F78938",
    primaryDisabled: "rgba(247, 136, 56, 0.5)",
    secondary: "#E63639",
  },
};
