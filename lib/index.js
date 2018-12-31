const fs = require('fs');
const path = require('path');

const mime = require('mime');

const { WebpackMiddlewareError } = require('./errors');

const done = (stats) => {
  console.log(stats);
};

const middleware = (compiler) => {
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
    const { publicPath } = compiler.options;
    const requestedUrl = req.originalUrl;

    // remove publicPath from the start
    const fileRequestUrl = requestedUrl.replace(publicPath, '');

    if (!fs.existsSync(fileRequestUrl)) {
      res.status(404);
      throw new WebpackMiddlewareError('File not found');
    }

    res.setHeader('Content-Type', mime.getType(path.resolve(fileRequestUrl)));
    res.send(fs.readFileSync(fileRequestUrl));

    return next();
  };
};

module.exports = middleware;
