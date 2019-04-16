const assert = require('assert');

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAIL';

module.exports = (app) => {
  /**
   * Trade 相关路由
   *
   * @class TradeController
   * @extends {app.Controller}
   */
  class TradeController extends app.Controller {
    /**
     * 创建 trade 的参数规则
     *
     * @readonly
     * @memberof TradeController
     */
    get createRule() {
      return {
        properties: {
          code: {
            type: 'string',
            maxLength: 40,
            minLength: 1,
          },
          commodity_id: this.ctx.helper.rule.uuid,
          count: {
            type: 'number',
          },
        },
        required: ['code', 'commodity_id', 'count'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * create trade
     *
     * @memberof TradeController
     * @return {promise} Trade
     */
    async create() {
      const { ctx, service, createRule } = this;
      const { code, commodity_id: commodityId, count } = await ctx.validate(createRule);
      ctx.authPermission();

      // 获取openid
      const resp = await service.wechat.openid(code);
      ctx.error(resp.data.openid, 'openid获取失败', 21001);

      // 生成order
      const commodity = await app.model.Commodity.findById(commodityId);
      ctx.error(commodity, '商品不存在', 18001);
      ctx.error(commodity.status === app.model.Commodity.STATUS.ON, '商品已下架', 18006);

      /* istanbul ignore next */
      const order = await app.model.Order.create({
        user_id: ctx.state.auth.user.id,
        commodity_price: commodity.realPrice * count,
        commodity_id: commodityId,
        count,
        open_id: resp.data.openid,
      });

      // 生成trade
      const [trade, payload] = await service.wechat.createTrade(order.id);

      ctx.jsonBody = {
        trade,
        payload,
      };
    }

    /**
     *  获取 trade 的参数规则
     *
     * @readonly
     * @memberof TradeController
     */
    get fetchRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * fetch trade
     *
     * @memberof TradeController
     * @returns {promise} trade
     */
    async fetch() {
      const param = await this.ctx.validate(this.fetchRule);

      const trade = await this.app.model.Trade.findById(param.id);
      this.ctx.assert(trade, 404);
      const order = await this.app.model.Order.findById(trade.order_id);
      assert(order, 'order should exist');

      this.ctx.checkPermission(order.user_id);

      this.ctx.jsonBody = trade;
    }

    /**
     * 微信回调接口
     * @returns {promise} 处理是否成功
     * @memberof TradeController
     */
    async wechatNotify() {
      const { ctx, service } = this;
      const { body } = this.ctx.request;
      const { Trade } = this.app.model;

      const {
        object2Xml, tn2uuid,
      } = service.wechat;

      /* istanbul ignore if */
      if (!this.service.wechat.verify(body)) {
        ctx.body = object2Xml({ return_code: FAILURE });
        return;
      }

      await this.service.trade.finishTrade(
        tn2uuid(body.out_trade_no),
        /* istanbul ignore next */
        body.result_code.toUpperCase() === SUCCESS ? Trade.STATUS.SUCCESS : Trade.STATUS.CLOSED,
      );
      ctx.body = object2Xml({ return_code: SUCCESS });
    }
  }
  return TradeController;
};
