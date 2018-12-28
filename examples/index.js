const express = require('express');

const app = express();

app.use((req, res, next) => {
  const publicPath = '/static/';
  if (req.originalUrl.includes(publicPath)) {
    console.log(req.originalUrl.replace(publicPath, ''));
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
