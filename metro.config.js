// eslint-disable-next-line import/no-extraneous-dependencies
const blacklist = require('metro-config/src/defaults/exclusionList');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Deny list is a function that takes an array of regexes and combines
// them with the default blacklist to return a single regex.
const blacklistRE = blacklist([
  // react-native-animated-charts
  /src\/react-native-animated-charts\/Example\/.*/,
  /src\/react-native-animated-charts\/node_modules\/.*/,
  'src.react-native-animated-charts.package.json',
  // react-native-reanimated <patch>
  /patches\/reanimated\/.*/,
]);
const extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('react-native-quick-crypto'),
  zlib: require.resolve('browserify-zlib'),
  https: require.resolve('https-browserify'),
  http: require.resolve('@tradle/react-native-http'),
  fs: require.resolve('react-native-fs'),
  path: require.resolve('path-browserify'),
  argon2: require.resolve('react-native-argon2'),
};

const transformer = {
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: true,
      inlineRequires: true,
    },
  }),
};

// Only run metro transforms on CI
if (process.env.CI) {
  transformer.babelTransformerPath = require.resolve('./metro.transform.js');
}

const rainbowConfig = {
  resolver: {
    blacklistRE,
    extraNodeModules: require('node-libs-react-native'),
  },
  transformer,
  resolver: {
    extraNodeModules,
  },
};
module.exports = mergeConfig(getDefaultConfig(__dirname), rainbowConfig);
