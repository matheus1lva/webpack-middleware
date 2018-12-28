class WebpackMiddlewareError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'WebpackMiddlewareError';
  }
}

module.exports = {
  WebpackMiddlewareError
};
