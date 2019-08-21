module.exports = {
  extends: ['eslint:recommended', 'google'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  rules: {
    'max-len': [2, 140, {
      ignoreComments: true,
      ignoreUrls: true,
      tabWidth: 2
    }],
    'require-jsdoc': 0,
    'valid-jsdoc': 0,
    'comma-dangle': 0,
    'arrow-parens': 0,
  }
};
