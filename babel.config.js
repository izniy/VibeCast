module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router
      'expo-router/babel',
      // NativeWind
      'nativewind/babel',
      // Module resolver for absolute imports
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.android.js',
            '.android.tsx',
            '.ios.js',
            '.ios.tsx',
          ],
          alias: {
            '@': '.',
            '@/components': './components',
            '@/hooks': './hooks',
            '@/lib': './lib',
            '@/providers': './providers',
            '@/services': './services',
            '@/types': './types',
          },
        },
      ],
    ],
  };
};
