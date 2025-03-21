const { getDefaultConfig } = require('@expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  return config;
})();
