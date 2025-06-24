const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const baseConfig = getDefaultConfig(__dirname);

const config = {
  ...baseConfig,
  resolver: {
    ...baseConfig.resolver,
    sourceExts: [...baseConfig.resolver.sourceExts, 'cjs']
  },
  transformer: {
    ...baseConfig.transformer,
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {}
  }
};

module.exports = config;