exports.notfound = {
  pageUrl:
    '/error?real_status=404&message=%e6%89%be%e4%b8%8d%e5%88%b0%e7%9b%b8%e5%85%b3%e8%b5%84%e6%ba%90'
};

exports.mongoose = {
  client: {
    url: 'mongodb://127.0.0.1/tracing_u_test',
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
