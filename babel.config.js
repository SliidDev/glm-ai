// Babel config for Expo SDK 54.
//
// IMPORTANT: we deliberately do NOT add 'react-native-reanimated/plugin'
// here. Starting with Reanimated v4 (the version paired with SDK 54's
// New Architecture-only runtime), babel-preset-expo already wires up
// the Reanimated/worklets babel transform internally. Adding the plugin
// a second time here can produce duplicate-transform errors.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
