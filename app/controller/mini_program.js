// @ts-nocheck
const fs = require('fs');
const gm = require('gm');
const path = require('path');

module.exports = (app) => {
  /**
   * 小程序相关Controller
   *
   * @class miniProgramController
   * @extends {app.Controller}
   */
  class miniProgramController extends app.Controller {
    /**
     * 参数验证 - 获取小程序码
     *
     * @readonly
     * @memberof miniProgramController
     */
    get indexRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取小程序码
     *
     * @returns {promise} 生成的小程序码
     * @memberof miniProgramController
     */
    async code() {
      const { ctx, indexRule } = this;
      const { grantType, tokenUrl, codeUrl } = app.config.miniProgram;
      const { appid, secret } = app.config.wechat;
      const { uuid2tn } = ctx.service.wechat;
      const { id } = await ctx.validate(indexRule);

      const token = await app.curl(
        tokenUrl,
        {
          dataType: 'json',
          data: {
            grant_type: grantType,
            appid,
            secret,
          },
        },
      );
      ctx.error(token.data.access_token, '小程序token获取失败', 23001);

      const url = `${codeUrl}?access_token=${token.data.access_token}`;
      const code = await app.curl(
        url,
        {
          method: 'POST',
          contentType: 'json',
          data: {
            page: 'pages/greetingcard/greetingcard',
            scene: uuid2tn(id),
          },
        },
      );
      ctx.error(token.data.access_token, '小程序码获取失败', 23002);

      ctx.body = code.data;
      ctx.set({
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'max-age=8640000',
      });
    }
  }
  return miniProgramController;
};

