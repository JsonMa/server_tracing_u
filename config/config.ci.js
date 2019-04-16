const config = require('./config.default');
const _ = require('lodash');

module.exports = app => _.merge(config(app), {
  noPrefix: true,
  sequelize: {
    host: 'postgres',
  },
  redis: {
    client: {
      host: 'redis',
    },
  },
});
