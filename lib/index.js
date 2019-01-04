/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const mime = require('mime');
const getPort = require('get-port');
const WebSocket = require('ws');

const { WebpackMiddlewareError } = require('./errors');
const applyPlugins = require('./plugins');

const messageBroadcaster = (wss) => {
  const clients = wss.clients.filter((client) => client.readyState === WebSocket.OPEN);
  return {
    broadcast: (data) => {
      clients.forEach((client) => {
        client.send(data);
      });
    }
  };
};

const middleware = async (compiler) => {
  const context = {};
  context.wsPort = await getPort({
    port: 6353
  });

  const socketServer = new WebSocket.Server({
    noServer: true,
    host: 'localhost',
    port: context.wsPort
  });

  const { broadcast } = messageBroadcaster(socketServer);

  if (!compiler) {
    throw new WebpackMiddlewareError(
      'No compiler provided to middleware. A compiler must be provided'
    );
  }

  // eslint-disable-next-line
  compiler.options.output = Object.assign(compiler.options.output, {
    hotUpdateChunkFilename: `webpack-middleware.js`,
    hotUpdateMainFilename: `webpack-middleware.json`
  });

  applyPlugins(compiler);

  compiler.hooks.done.tap('webpack-plugin', ({ hash }) => {
    if (context.lastHash !== hash) {
      broadcast({
        action: 'done',
        data: {
          hash
        }
      });
    }
  });

  context.watching = compiler.watch({}, (err) => {
    if (err) {
      console.error(chalk.red(err));
    }
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
