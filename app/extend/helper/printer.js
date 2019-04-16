// const qs = require('querystring');
const time = require('moment')().format('X');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const { yLink } = require('../../../config/config.default')();

module.exports = {

  // 接口签名
  singnature(timestamp) {
    const sign = yLink.client_id + timestamp + yLink.api_key;
    return crypto.createHash('md5').update(sign).digest('hex');
  },

  // 获取stringfy后的sign
  genSign(data) {
    const obj = {
      scope: 'all',
      sign: this.singnature(time),
      id: uuid(),
      timestamp: time,
    };
    return { ...obj, ...data };
  },

  uuid() {
    return uuid();
  },
};
