// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  // Ignore build artifacts
  { ignores: ['dist', 'node_modules', 'eslint.config.js', 'public/mockServiceWorker.js', 'postcss.config.js'] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript – type-aware rules
  ...tseslint.configs.recommendedTypeChecked,

  // React extras
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,

  // Project rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      // NOTE: using ESM in config; this keeps TS aware of your project
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        // use the directory of this config as tsconfig root
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    rules: {
      // Good with Vite HMR
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Prefer TS version of unused-vars; calm down noise
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Nice DX: import types as types (optional, but keeps React 19 clean)
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

      // These help avoid accidental any/unsafe stuff without being overbearing
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
    },
  },
])
