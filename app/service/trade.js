// @ts-nocheck
const co = require('co');
const assert = require('assert');

module.exports = (app) => {
  /**
   * 交易 Service
   *
   * @class Trade
   * @extends {app.Service}
   */
  class TradeService extends app.Service {
    /**
     * 完成交易
     *
     * @param {string} tradeId 交易ID
     * @param {string} status 交易状态
     * @returns {promise} trade
     * @memberof Trade
     */
    finishTrade(tradeId, status) {
      const { ctx } = this;

      /* istanbul ignore next */
      return co.wrap(function* () {
        const {
          Trade, Order, Commodity, User,
        } = app.model;
        const trade = yield Trade.findById(tradeId); // 获取支付订单
        const order = yield Order.findById(trade.order_id); // 获取商品订单
        const commodity = yield Commodity.findById(order.commodity_id); // 获取商品
        const user = yield User.findById(order.user_id); // 获取下单用户

        ctx.assert(trade, '订单不存在', 25001);

        switch (status) {
          case Trade.STATUS.CLOSED:
          case Trade.STATUS.FINISHED:
            trade.status = Trade.STATUS.CLOSED;
            yield trade.save();
            break;
          case app.model.Trade.STATUS.SUCCESS:
            yield app.model.transaction(t => app.model.Order.update({
              trade_id: trade.id,
              status: Order.STATUS.PAYED,
            }, {
              where: {
                id: trade.order_id,
              },
              transaction: t,
            }).then(() => {
              trade.status = Trade.STATUS.SUCCESS;
              return trade.save({
                transaction: t,
              }).then(() => {
                if (commodity.quata) {
                  user.card_num += commodity.quata * order.count;
                  user.card_total += commodity.quata * order.count;
                }
                return user.save({
                  transaction: t,
                }).then(() => {
                  commodity.sales += order.count;
                  return commodity.save({
                    transaction: t,
                  });
                });
              });
            }));
            break;
          default:
            assert(false);
            break;
        }
      })();
    }
  }

  return TradeService;
};
