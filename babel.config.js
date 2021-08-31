module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: {
        node: 'current'
      }
    }]
  ],
  plugins: [
    [
      '@babel/plugin-proposal-record-and-tuple',
      {
        importPolyfill: true,
        syntaxType: 'hash'
      }
    ],
    '@babel/plugin-syntax-typescript'
  ]
};
