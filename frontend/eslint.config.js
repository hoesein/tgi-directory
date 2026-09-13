// Flat config for ESLint v9+ (see .eslintrc.js for legacy reference).
// eslint-config-expo@57 still exports a legacy config object, so this file
// is self-contained: @typescript-eslint flat rules + prettier.
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  { ignores: ['eslint.config.js'] },
  ...tsPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
