module.exports = {
  env: {
    browser: true,
    mocha: true,
    node: true,
  },
  extends: 'airbnb/base',
  globals: {
    window: 'readonly',
    LuckyCart: 'readonly',
    luckycartSDK: 'readonly',
    Splide: 'readonly',
    tingle: 'readonly',
    CryptoJS: 'readonly',
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'brace-style': [ 'error', '1tbs', { allowSingleLine: false } ],
    indent: [ 'error', 2 ],
    'nonblock-statement-body-position': [ 'error', 'below' ],
    'no-else-return': 'error',
    'no-var': 'error',
    quotes: [ 'error', 'single', { avoidEscape: true } ],
    semi: [ 'error', 'always' ],
    'no-plusplus': [ 'error', { allowForLoopAfterthoughts: true } ],
    'no-underscore-dangle': [ 'error', { allow: [ '_id', '_LC_' ] } ],
    'class-methods-use-this': 'off',
    'max-len': [ 'error', { code: 160, tabWidth: 2, ignoreComments: true } ],
    'no-console': [ 'warn' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
  },
};
