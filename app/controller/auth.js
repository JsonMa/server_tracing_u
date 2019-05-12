'use strict';

const uuid = require('uuid/v4');

module.exports = app => {
  /**
   * Auth 相关路由
   *
   * @class AuthController
   * @extends {app.Controller}
   */
  class AuthController extends app.Controller {
    /**
     * login 的参数规则
     *
     * @readonly
     * @memberof AuthController
     */
    get loginRule() {
      return {
        properties: {
          code: {
            type: 'string',
          },
        },
        required: ['code'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * logger
     *
     * @readonly
     * @memberof AuthController
     */
    get logger() {
      const handler = {
        get(target, attrName) {
          if (attrName in target) {
            return target[attrName].bind(target, '[AuthController]');
          }
        },
      };
      return new Proxy(this.ctx.logger, handler);
    }

    /**
     * login
     *
     * @memberof AuthController
     * @return {Object} user & token
     */
    async login() {
      const { ctx, loginRule } = this;

      const { code } = await ctx.verify(loginRule, ctx.request.body);
      const { openid, session_key } = await this.code2Session(code);
      const user = await ctx.service.user.findOne({
        openid,
      });
      let isRegistered = false;
      const sessionData = {
        openid,
        isRegistered,
      };
      if (user) {
        isRegistered = true;
        sessionData.role_type = user.role_type;
        sessionData.role_id = user.role_id;
        sessionData.isRegistered = true;
      }
      const token = uuid();
      app.redis
        .set(`${app.config.auth.prefix}:${token}`, JSON.stringify(sessionData))
        .expire(`${app.config.auth.prefix}:${token}`, session_key);
      ctx.cookies.set('access_token', token);
      ctx.jsonBody = {
        token,
        user,
        isRegistered,
      };
    }

    /**
     * logout
     *
     * @memberof AuthController
     * @return {object} 返回登出结果
     */
    async logout() {
      const { ctx } = this;
      const { access_token: token } = ctx.header;

      const ret = await app.redis.del(`${app.config.auth.prefix}:${token}`);
      ctx.assert(ret === 1, '退出登录失败', 500);
      ctx.jsonBody = null;
    }

    /**
     * code2Session
     *
     * @param {string} code - login codee
     * @return {promise} session data
     * @memberof AuthController
     */
    async code2Session(code) {
      const { ctx } = this;
      const config = ctx.app.config.wechat;
      ctx.assert(typeof code === 'string', 'code需为字符串', 400);

      const { data } = await ctx.curl(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          method: 'GET',
          data: {
            appid: config.appid,
            secret: config.secret,
            js_code: code,
            grant_type: config.grant_type,
          },
          dataType: 'json',
        }
      );
      const { errcode, errmsg } = data;
      if (errcode) {
        this.logger.error(`[code2Session] - code: ${errcode}, msg: ${errmsg}`);
        ctx.error(11005, 'wechat code错误');
      }
      return data;
    }
  }
  return AuthController;
};
