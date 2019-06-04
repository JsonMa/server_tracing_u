'use strict';
const TOKEN = 'access_token';

/* istanbul ignore next */
module.exports = () =>
  function* (next) {
    // 接口白名单
    const whiteUrlLists = [
      {
        method: ['GET'],
        url: '/api/auth',
      },
      {
        method: ['GET'],
        url: '/api/files',
      },
      {
        method: ['GET'],
        url: '/api/tracings',
      },
      {
        method: ['GET'],
        url: '/page/tracing',
      },
    ];
    for (let i = 0; i < whiteUrlLists.length; i++) {
      const item = whiteUrlLists[i];
      if (
        this.request.url.includes(item.url) &&
        item.method.includes(this.method)
      ) {
        yield next;
        return;
      }
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
        this.state.auth = Object.assign(JSON.parse(ret), {
          token,
        });
      } catch (e) {
        yield this.app.redis.set(`token:${token}`, null);
        this.cookies.set(TOKEN, null);
        this.error(10002, '用户信息解析失败', 500);
      }
    } else {
      this.cookies.set(TOKEN, null);
      this.error(false, 10001, `登录已过期，请重新登录,Token: ${token}`);
    }
    yield next;
  };
