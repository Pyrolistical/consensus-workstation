const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.js',
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: 'current'
                  }
                }
              ],
              ['@babel/preset-react']
            ]
          }
        }
      }
    ]
  }
};
