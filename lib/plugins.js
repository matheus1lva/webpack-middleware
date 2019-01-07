const StylishReporter = require('webpack-stylish');
const { DefinePlugin } = require('webpack');

module.exports = (compiler, context) => {
  new StylishReporter().apply(compiler);
  new DefinePlugin({
    __WS_PORT__: JSON.stringify(context.wsPort)
  }).apply(compiler);
};
