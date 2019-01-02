const fs = require('fs');
const path = require('path');

const mime = require('mime');

const { WebpackMiddlewareError } = require('./errors');

const done = (stats) => {
  // console.log(stats.toJson());
};

const middleware = (compiler) => {
  const context = {};
  if (!compiler) {
    throw new WebpackMiddlewareError(
      'No compiler provided to middleware. A compiler must be provided'
    );
  }

  compiler.hooks.done.tap('webpack-middleware', done);

  context.watching = compiler.watch({}, (err) => {
    console.error(err);
  });

  return (req, res, next) => {
    const { publicPath, path: webpackOutputPath } = compiler.options.output;
    const requestedUrl = req.originalUrl;

    // remove publicPath from the start
    const fileRequestUrl = requestedUrl.replace(publicPath, '');

    const fileResolved = path.resolve(path.join(webpackOutputPath, fileRequestUrl));

    if (fileRequestUrl === '/') {
      return next();
    }

    if (!fs.existsSync(fileResolved)) {
      res.status(404);
      throw new WebpackMiddlewareError('File not found');
    }

    res.setHeader('Content-Type', mime.getType(path.resolve(fileResolved)));
    res.send(fs.readFileSync(fileResolved));

    return next();
  };
};

module.exports = middleware;
