const path = require('path');

const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: ['./app.js', '../lib/client.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
