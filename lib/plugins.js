const StylishReporter = require('webpack-stylish');
const { DefinePlugin } = require('webpack');

module.exports = (compiler, context) => {
  new StylishReporter().apply(compiler);
  new DefinePlugin({
    wsPort: JSON.stringify(context.wsPort)
  }).apply(compiler);
};
