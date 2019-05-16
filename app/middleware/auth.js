'use strict';
const TOKEN = 'access_token';

/* istanbul ignore next */
module.exports = () =>
  function* (next) {
    // 设置接口白名单
    const whiteUrlLists = ['/api/auth/login'];
    if (whiteUrlLists.includes(this.request.url)) {
      yield next;
      return;
    }
    const token =
      this.headers[TOKEN] ||
      this.cookies.get(TOKEN, {
        signed: false,
      });
    this.error(token, 400, '未获取到access_token', 400);
    const ret = yield this.app.redis.get(`token:${token}`);
    if (ret) {
      try {
        this.state.auth = Object.assign(JSON.parse(ret), { token });
      } catch (e) {
        yield this.app.redis.set(`token:${token}`, null);
        this.cookies.set(TOKEN, null);
        this.error(10002, '用户信息解析失败', 500);
      }
    }
    yield next;
  };
