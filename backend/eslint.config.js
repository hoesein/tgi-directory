const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/', '.next/', 'eslint.config.js', 'next-env.d.ts'] },
  ...tsPlugin.configs['flat/recommended'],
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
