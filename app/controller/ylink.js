module.exports = (app) => {
  /**
   * ylink相关Controller
   *
   * @class ylinkController
   * @extends {app.Controller}
   */
  class ylinkController extends app.Controller {
    /**
     * 易联云-获取token
     *
     * @returns {object} token
     * @memberof ylinkController
     */
    async accessToken() {
      const { ctx } = this;
      const { yLink } = app.config;
      const accessToken = await app.redis.get('token:access') || null;

      if (accessToken) return;

      const data = {
        grant_type: 'client_credentials',
        client_id: yLink.client_id,
      };

      const result = await ctx.curl(`${yLink.base}${yLink.token}`, {
        method: 'POST',
        data: ctx.helper.printer.genSign(data),
        dataType: 'json', // 以JSON格式处理返回的响应body
      });

      ctx.error(result.data.error === '0', result.data.error_description, 18001);
      await app.redis.set('token:access', result.data.body.access_token);
      await app.redis.set('token:refresh', result.data.body.refresh_token);
    }

    /**
     * 易联云-更新token
     *
     * @returns {object} refreshed token
     * @memberof ylinkController
     */
    async refreshToken() {
      const { ctx } = this;
      const { yLink } = app.config;
      const refreshToken = await app.redis.get('token:refresh');
      const data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: yLink.client_id,
      };
      const result = await ctx.curl(`${yLink.base}${yLink.token}`, {
        method: 'POST',
        data: ctx.helper.printer.genSign(data),
        dataType: 'json', // 以JSON格式处理返回的响应body
      });
      ctx.error(result.data.error === '0', result.data.error_description, 18001);

      await app.redis.set('token:access', result.data.body.access_token);
      await app.redis.set('token:refresh', result.data.body.refresh_token);
    }

    /**
     * 易联云-消息推送验证
     *
     * @returns {object} 验证信息
     * @memberof ylinkController
     */
    async pushValidate() {
      const { ctx } = this;
      ctx.status = 200;
      ctx.body = { data: 'OK' };
    }

    /**
     * 易联云-获取推送消息
     *
     * @returns {null} 无响应信息
     * @memberof ylinkController
     */
    async pushData() {
      const { ctx } = this;

      const { sign } = ctx.request.body;
      ctx.status = 200;
      ctx.body = { data: 'OK' };
    }

    /**
     * 易联云-生成打印菜单
     *
     * @returns {null} 无响应信息
     * @memberof ylinkController
     */
    async menuCreate() {
      const { ctx } = this;
      const { yLink } = app.config;
      const accessToken = await app.redis.get('token:access');

      if (accessToken == null || accessToken === '') ctx.error(404, 'access token Not Found');

      const data = {
        content: {
          printmenu: new Array(`${encodeURIComponent('测5试')}`, `${encodeURIComponent('http://test')}`), // eslint-disable-line 
        },
        access_token: accessToken,
        machine_code: yLink.personal.machine_code,
        client_id: yLink.client_id,
      };

      // 生成订单
      const result = await ctx.curl(`${yLink.base}${yLink.menuCreate}`, {
        method: 'POST',
        data: ctx.helper.printer.genSign(data),
        dataType: 'json', // 以JSON格式处理返回的响应body
      });

      ctx.error(result.data.error === '0', result.data.error_description, 18001);
    }

    /**
     * 易联云-打印
     *
     * @returns {null} 无返回内容
     * @memberof ylinkController
     */
    async print() {
      const { ctx } = this;
      const { yLink } = app.config;
      const accessToken = await app.redis.get('token:access');

      const content = '<QR>http://www.baidu.com</QR>';

      const data = {
        client_id: yLink.client_id,
        access_token: accessToken,
        machine_code: yLink.personal.machine_code,
        origin_id: ctx.helper.printer.uuid(),
        content,
      };

      const result = await ctx.curl(`${yLink.base}${yLink.printIndex}`, {
        method: 'POST',
        data: ctx.helper.printer.genSign(data),
        dataType: 'json', // 以JSON格式处理返回的响应body
      });

      ctx.error(result.data.error === '0', result.data.error_description, 18001);
    }
  }

  return ylinkController;
};

