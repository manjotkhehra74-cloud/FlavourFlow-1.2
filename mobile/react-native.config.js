// Exclude unused modules that cause Gradle build issues on Expo SDK 51.
module.exports = {
  dependencies: {
    '@expo/dom-webview': {
      platforms: { android: null, ios: null },
    },
  },
};
