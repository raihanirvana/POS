import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';

const codeFiles = ['client/**/*.{js,jsx}', 'server/**/*.js', 'scripts/**/*.js', '*.js'];

export default [
  {
    ignores: [
      'node_modules/**',
      'client/dist/**',
      'dist/**',
      'data/**',
      'screenshots/**',
    ],
  },
  {
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
  },
  {
    files: codeFiles,
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      ...js.configs.recommended.rules,
      'max-lines-per-function': [
        'error',
        {
          max: 25,
          skipBlankLines: false,
          skipComments: false,
          IIFEs: true,
        },
      ],
      'max-statements-per-line': ['error', { max: 1 }],
      'max-len': ['error', { code: 100, ignoreUrls: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },
  {
    files: ['client/src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    files: ['server/**/*.js', 'scripts/**/*.js', '*.js', 'client/vite.config.js'],
    languageOptions: { globals: globals.node },
  },
];
