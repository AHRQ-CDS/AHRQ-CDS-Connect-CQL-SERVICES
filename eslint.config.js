const js = require('@eslint/js');
const globals = require('globals');

const config = [
  js.configs.recommended,
  {
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'always']
    },
    languageOptions: {
      globals: {
        ...globals.es2017,
        ...globals.node,
        ...globals.mocha
      }
    }
  }
];

module.exports = config;
