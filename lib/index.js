const { WebpackMiddlewareError } = require('./errors');

const fs = require('fs');

const done = (stats) => {
  console.log(stats);
};

const middleware = (compiler) => {
  if (!compiler) {
    throw new WebpackMiddlewareError(
      'No compiler provided to middleware. A compiler must be provided'
    );
  }
  // compiler.hooks.done.tap('webpack-middleware', done);

  // context.watching = compiler.watch({}, (err) => {
  //   console.error(err);
  // });

  return (req, res, next) => {
    const { publicPath } = compiler.options;
    const requestedUrl = req.originalUrl;

    // remove publicPath from the start
    const fileRequestUrl = requestedUrl.replace(publicPath, '');

    // what we are left with is either
    // a directory/filename.ext => js/main.js
    // or a file => main.js

    // if(fs.existsSync())

    // serve that content back to the user

    return next();
  };
};

module.exports = middleware;
