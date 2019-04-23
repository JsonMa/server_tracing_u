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
     * login
     *
     * @memberof AuthController
     * @return {Object} user & token
     */
    async login() {
      const { ctx, loginRule } = this;

      const { code } = await ctx.verify(loginRule, ctx.request.body);
      const { openid, session_key, unionid } = await this.code2Session(code);
      const user = await ctx.service.user.findOne({ unionid });
      let isRegistered = false;
      const sessionData = {
        openid,
        session_key,
        unionid,
        isRegistered,
      };
      if (user) {
        isRegistered = true;
        sessionData.role_type = user.role_type;
        sessionData.role_id = user.role_id;
        sessionData.isRegistered = true;
      }
      const token = uuid();
      app.redis.set(
        `${app.config.auth.prefix}:${token}`,
        JSON.stringify(sessionData)
      );
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
      ctx.assert(ret === 1, '退出登登录失败', 500);
      ctx.jsonBody = { data: '退出登登录失败' };
    }

    /**
     * code2Session
     *
     * @param {string} code - login codee
     * @return {promise} session data
     * @memberof AuthController
     */
    code2Session(code) {
      const { ctx } = this;
      const config = ctx.config.wechat;
      ctx.assert(typeof code === 'string', 'code需为字符串', 400);

      return ctx.curl(`${config.openid_url}`, {
        method: 'GET',
        data: {
          appid: config.appid,
          secret: config.secret,
          js_code: code,
          grant_type: config.grant_type,
        },
        dataType: 'json', // 以JSON格式处理返回的响应body
      });
    }
  }
  return AuthController;
};
