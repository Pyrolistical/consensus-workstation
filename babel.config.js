module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ],
  plugins: [
    [
      '@babel/plugin-proposal-record-and-tuple',
      {
        importPolyfill: true,
        syntaxType: 'hash'
      }
    ]
  ]
};
