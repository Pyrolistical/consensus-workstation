const HtmlWebpackPlugin = require('html-webpack-plugin');
const BabelConfig = require('./babel.config.js');

module.exports = {
  entry: './index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.((j|t)s)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [...BabelConfig.presets, '@babel/preset-react'],
            plugins: BabelConfig.plugins
          }
        }
      }
    ]
  }
};
