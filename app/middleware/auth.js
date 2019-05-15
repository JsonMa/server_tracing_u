'use strict';

const TOKEN = 'access_token';

/* istanbul ignore next */
module.exports = option =>
  function* (next) {
    // 设置接口白名单
    const whiteUrlLists = ['/api/auth/login'];
    if (whiteUrlLists.includes(this.request.url)) yield next;
    const token =
      this.headers[TOKEN] ||
      this.cookies.get(TOKEN, {
        signed: false,
      });
    const ret = yield this.app.redis.get(`${option.prefix}:${token}`);
    this.error(ret, 10001, '未登录或access_token已过期', 403);
    try {
      this.state.auth = JSON.parse(ret);
    } catch (e) {
      yield this.app.redis.set(`${option.prefix}:${token}`, null);
      this.cookies.set(TOKEN, null);
      this.error(10001, 'access_token已过期, 请重新登录', 401);
    }
    yield next;
  };
