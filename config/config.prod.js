exports.notfound = {
  pageUrl:
    '/error?real_status=404&message=%e6%89%be%e4%b8%8d%e5%88%b0%e7%9b%b8%e5%85%b3%e8%b5%84%e6%ba%90'
};
exports.mongoose = {
  username: 'dbuser',
  password: 'root123456',
  database: 'huayan',
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  benchmark: true
};

exports.redis = {
  client: {
    port: 6379,
    host: 'localhost',
    password: '',
    db: 0
  }
};

exports.noPrefix = false;

exports.auth = {
  prefix: 'huayan'
};
