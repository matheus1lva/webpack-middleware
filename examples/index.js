const path = require('path');

const express = require('express');
const webpack = require('webpack');

const middleware = require('../lib/index');
// const middleware = require('webpack-dev-middleware');

const config = require('./webpack.config');

const app = express();
const compiler = webpack(config);

app.use(middleware(compiler));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
