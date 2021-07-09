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

// const wpmEmitter = new EventEmitter();
let instance = null;

module.exports = class MyMiddleware extends EventEmitter {
  constructor(compiler) {
    super();

    if (instance) {
      return;
    }

    instance = this;
    this.socketServer = new WebSocket.Server({
      noServer: true,
      host: 'localhost',
      port: 65530
    });

    if (!compiler) {
      throw new WebpackMiddlewareError(
        'No compiler provided to middleware. A compiler must be provided'
      );
    }

    this.compiler = compiler;

    applyPlugins(compiler, { wsPort: 65530 });

    compiler.hooks.done.tap('webpack-middleware', ({ hash }) => {
      this.emit('done', {
        action: 'done',
        data: {
          hash
        }
      });
    });

    this.watching = compiler.watch({}, (err) => {
      if (err) {
        console.error(chalk.red(err));
      }
    });

    this.middleware = this.middleware.bind(this);

    this.socketServer.on('connection', (ws) => {
      ws.send(JSON.stringify({ action: 'connection' }));
      this.on('done', (data) => {
        ws.send(JSON.stringify(data));
      });
    });
  }

  middleware(req, res, next) {
    const { publicPath = '/', path: webpackOutputPath } = this.compiler.options.output;
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
  }
};
