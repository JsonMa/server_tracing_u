exports.mongoose = {
  client: {
    url: 'mongodb://tracing_u:tracing_u123456@127.0.0.1/tracing_u',
    options: {}
  }
};

exports.redis = {
  client: {
    port: 6379,
    host: 'localhost',
    password: 'tracing_redis123456',
    db: 0
  }
};

exports.noPrefix = false;

exports.auth = {
  prefix: 'tracing_u'
};
