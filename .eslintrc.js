/*
 * @Author: 张明宣
 * @Date: 2024-08-14 17:31:59
 * @LastEditors: 张明宣
 * @LastEditTime: 2024-08-14 18:26:34
 * @FilePath: \recording\.eslintrc.js
 * @Description:
 *
 */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'no-param-reassign': 'off',
    'no-tabs': 'off',
    'no-plusplus': 'off',
    'linebreak-style': 'off',
    'multi-word-component-names': 'off',
    indent: 'off',
    'max-len': 'off',
    'vuejs-accessibility/label-has-for': 'off',
    'newline-per-chained-call': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
