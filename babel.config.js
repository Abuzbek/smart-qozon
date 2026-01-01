module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Keep your existing plugins (like reanimated or dotenv)
      // Add this new one:
      ["transform-import-meta", { module: "ES6" }],
    ],
  };
};
