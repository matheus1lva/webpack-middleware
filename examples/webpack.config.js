const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['./app.js', 'webpack-hot-middleware/client'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
