import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  extends: ['eslint:recommended', '@eslint/js'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      console: 'readonly',
      process: 'readonly',
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
})
