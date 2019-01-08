/* eslint-disable consistent-return */
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const chalk = require('chalk');
const mime = require('mime');
// const getPort = require('get-port');
const WebSocket = require('ws');

const { WebpackMiddlewareError } = require('./errors');
const applyPlugins = require('./plugins');

const wpmEmitter = new EventEmitter();

const middleware = (compiler) => {
  const context = {};
  context.wsPort = 65530;

  const socketServer = new WebSocket.Server({
    noServer: true,
    host: 'localhost',
    port: context.wsPort
  });

  socketServer.on('connection', (ws) => {
    ws.send(JSON.stringify({ action: 'connection' }));
    wpmEmitter.on('done', (data) => {
      ws.send(JSON.stringify(data));
    });
  });

  if (!compiler) {
    throw new WebpackMiddlewareError(
      'No compiler provided to middleware. A compiler must be provided'
    );
  }

  applyPlugins(compiler, context);

  compiler.hooks.done.tap('webpack-middleware', ({ hash }) => {
    wpmEmitter.emit('done', {
      action: 'done',
      data: {
        hash
      }
    });
  });

  context.watching = compiler.watch({}, (err) => {
    if (err) {
      console.error(chalk.red(err));
    }
  });

  return (req, res, next) => {
    const { publicPath = '/', path: webpackOutputPath } = compiler.options.output;
    const requestedUrl = req.originalUrl;

    if (requestedUrl === '/') {
      return next();
    }

    if (requestedUrl.startsWith(publicPath)) {
      const fileRequestUrl = requestedUrl.replace(publicPath, '');
      const fileResolved = path.resolve(path.join(webpackOutputPath, fileRequestUrl));
      try {
        fs.statSync(fileResolved);
      } catch (err) {
        return next();
      }
      res.setHeader('Content-Type', mime.getType(path.resolve(fileResolved)));
      res.write(fs.readFileSync(fileResolved));
      res.end();
    }
  };
};

module.exports = middleware;
