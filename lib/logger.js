const chalk = require('chalk');
const loglevel = require('loglevelnext');

const colors = {
  trace: 'cyan',
  debug: 'magenta',
  info: 'blue',
  warn: 'yellow',
  error: 'red'
};

const getLogger = () => {
  const prefix = {
    level: ({ level }) => {
      const color = colors[level];
      return chalk[color](`wm: `);
    },
    template: '{{level}}'
  };

  return loglevel.create({
    prefix,
    level: 'error',
    name: 'webpack-middleware'
  });
};

module.exports = {
  getLogger
};
