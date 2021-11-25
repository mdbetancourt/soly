module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier' // must be last
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  env: {
    node: true
  },
  ignorePatterns: ['*.cjs'],
  rules: {
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': ['error']
  }
};
