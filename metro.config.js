// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Enable 'mjs' support
config.resolver.sourceExts.push("mjs");

// 2. CRITICAL FIX: Force Metro to pick "require" (CommonJS) over "import" (ESM)
// This makes it grab the version of Zustand/Supabase that DOES NOT use import.meta.
config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
];

module.exports = config;
