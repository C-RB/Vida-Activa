// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Text is styled only with the Type tokens and colors only with the Colors tokens (constants/theme).
const typography = {
  selector: 'Property[key.name=/^(fontSize|fontFamily|fontWeight|lineHeight|letterSpacing)$/]',
  message: 'Use a Type token from constants/theme (e.g. ...Type.body) instead of raw font styles.',
};
const hexColor = {
  selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
  message: 'Use the Colors tokens from constants/theme instead of hex colors.',
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', typography],
    },
  },
  // Screens and routes only compose shared components and theme tokens. The component rules are warnings while
  // the legacy screens are migrated; each redesigned screen must have none, then they become errors.
  {
    files: ['screens/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', typography, hexColor],
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
          ],
        },
      ],
    },
  },
]);
