// @ts-nocheck
module.exports = () => {
  const exports = {};

  exports.keys = 'tracingu-server';

  exports.middleware = ['error', 'auth'];

  exports.formidable = {
    uploadDir: 'files',
    multiples: true
  };

  exports.compress = {
    jpg_level: 'low', // low, medium, high, veryhigh
    png_level: 2, // 0-7
    png_quality: '65-80', // 0-100
    jpg_quality: 40, // 0-100
    output_dir: 'files'
  };

  // 微信支付
  exports.wechat = {
    appid: 'wx88168e0c2c6b3bf2', // 小程序appid
    mch_id: 1495285102, // 微信支付mchid
    trade_type: 'JSAPI',
    key: 'huayanxiaochengxu9090ERWEIMAHEKA', // 微信支付key
    secret: '28556546aac6d2fd0669a9fdb1c54f7f', //小程序的 app secret
    grant_type: 'authorization_code', // token换取openid所需的
    openid_url: 'https://api.weixin.qq.com/sns/jscode2session', // openid获取地址
    unifiedorder_url: 'https://api.mch.weixin.qq.com/pay/unifiedorder' // 统一下单接口地址
  };

  // 小程序api
  exports.miniProgram = {
    grantType: 'client_credential',
    tokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
    codeUrl: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit'
  };

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

  exports.security = {
    csrf: {
      enable: false,
      ignoreJSON: true // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    }
  };

  exports.siteFile = {
    '/favicon.ico': '/static/favicon.ico'
  };

  exports.onerror = {
    html(err) {
      this.body = this.renderError(err);
      this.status = err.status;
    }
  };

  exports.logger = {
    disableConsoleAfterReady: false
  };

  exports.host = 'https://buildupstep.cn';

  return exports;
};
