module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-native',
    '@typescript-eslint'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-raw-text': 'off',
    // Custom rule to discourage direct toFixed usage
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'CallExpression[callee.property.name="toFixed"]',
        message: 'Avoid using toFixed directly. Use safeToFixed from utils/safeToFixed instead. If you must use toFixed, add: // eslint-disable-next-line no-restricted-syntax'
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    'react-native/react-native': true,
    'jest': true
  }
};