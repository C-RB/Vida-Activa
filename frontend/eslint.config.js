// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Screens and routes only compose shared components and theme tokens.
// These are warnings while the legacy screens are migrated; each redesigned
// screen must have none, and the rules become errors once all are migrated.
const screenRules = {
  'react/no-multi-comp': ['warn', { ignoreStateless: false }],
  'no-restricted-imports': [
    'warn',
    {
      paths: [
        {
          name: 'react-native',
          importNames: ['TextInput', 'TouchableOpacity', 'Pressable'],
          message:
            'Use the shared components in components/ui (Button, TextButton, TextField, ...).',
        },
        {
          name: 'expo-font',
          importNames: ['useFonts'],
          message: 'Use useAppFonts() from hooks/useAppFonts.',
        },
      ],
    },
  ],
  'no-restricted-syntax': [
    'warn',
    {
      selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
      message: 'Use the Colors tokens from constants/theme instead of hex colors.',
    },
  ],
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['screens/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    rules: screenRules,
  },
]);
