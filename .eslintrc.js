module.exports = {
  extends: [
    '.eslintrc.base.js',
    'plugin:react/jsx-runtime',
    'plugin:@next/next/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
}
