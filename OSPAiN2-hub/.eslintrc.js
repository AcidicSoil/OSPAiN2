module.exports = {
  extends: ['react-app'],
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-anonymous-default-export': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
