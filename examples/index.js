const path = require('path');

const express = require('express');
const webpack = require('webpack');

const Middleware = require('../lib/index');
// const middleware = require('webpack-dev-middleware');

const config = require('./webpack.config');

const app = express();
const compiler = webpack(config);

const middlewareInstance = new Middleware(compiler);

app.use(middlewareInstance.middleware);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
