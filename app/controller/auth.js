// @ts-nocheck
const uuid = require('uuid/v4');
const crypto = require('crypto');

module.exports = (app) => {
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
          phone: {
            type: 'string',
          },
          password: {
            type: 'string',
          },
        },
        required: ['phone', 'password'],
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
      const {
        ctx, loginRule,
      } = this;

      let ecptPassword = '';
      const {
        phone, password,
      } = await ctx.validate(loginRule);
      const user = await this.app.model.User.findOne({
        where: { phone },
      });

      /* 数据库验证 */
      const md5 = crypto.createHash('md5');
      ecptPassword = md5.update(password).digest('hex');
      ctx.error(user && ecptPassword === user.password, '账号或密码错误', 10002, 400);
      const token = uuid();
      app.redis.set(`${app.config.auth.prefix}:${token}`, JSON.stringify({ role: user.role, id: user.id }));
      ctx.cookies.set('access_token', token);
      ctx.jsonBody = {
        user,
        token,
      };
    }

    /**
     * logout
     *
     * @memberof AuthController
     * @returns {object} 返回登出结果
     */
    async logout() {
      const {
        ctx,
      } = this;
      const { access_token: token } = ctx.header;

      const ret = await app.redis.del(`${app.config.auth.prefix}:${token}`);
      ctx.error(ret !== 1, '退出登登录失败', 10999);
      ctx.jsonBody({
        msg: '成功退出登录',
      });
    }
  }
  return AuthController;
};
