'use strict';

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
      const {
        openid,
        session_key,
        expires_in,
        errcode,
        errmsg,
      } = await this.code2Session(code);
      ctx.error(!errcode, 10002, errmsg); // 获取openid
      const isUserExist = await ctx.service.user.findOne({
        openid,
      }); // 验证该openid下的用户是否存在
      let isRegistered = false;
      let user;
      const sessionData = {
        openid,
        isRegistered,
      };
      if (isUserExist) {
        user = isUserExist;
        isRegistered =
          isUserExist.role_type !== 'unauthed' &&
          isUserExist.state === 'passed';
        sessionData.role_type = isUserExist.role_type;
        sessionData.role_id = isUserExist.role_id;
        sessionData.user_id = isUserExist._id;
        sessionData.isRegistered = isRegistered;
        const { nModified } = await ctx.service.user.update(
          {
            _id: isUserExist._id,
          },
          {
            last_login: new Date(),
          }
        );
        ctx.error(nModified === 1, 11008, '修改登录时间失败');
      } else {
        const createdUser = await ctx.service.user.create({
          openid,
        });
        user = createdUser;
        sessionData.user_id = createdUser._id;
        sessionData.role_type = createdUser.role_type;
        sessionData.role_id = createdUser.role_id;
        sessionData.isRegistered = false;
      }
      await ctx.app.redis.set(
        `token:${session_key}`,
        JSON.stringify(sessionData),
        'EX',
        expires_in || 7200
      );
      ctx.cookies.set('access_token', session_key, {
        signed: false,
        httponly: false,
        domain: '.buildupstep.cn',
        path: '/',
      });
      ctx.jsonBody = {
        token: session_key,
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

      const ret = await ctx.app.redis.del(`token:${token}`);
      ctx.error(ret === 1, 11009, '退出登录失败');
      ctx.cookies.set('access_token', '', {
        signed: false,
        maxAge: 0,
      }); // 清除access_token
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
      }
      return data;
    }
  }
  return AuthController;
};
