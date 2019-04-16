const _ = require('lodash');

module.exports = (app) => {
  /**
   * Order 相关路由
   *
   * @class OrderController
   * @extends {app.Controller}
   */
  class OrderController extends app.Controller {
    /**
     * create order 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get createRule() {
      return {
        properties: {
          commodity_id: this.ctx.helper.rule.uuid,
          count: {
            type: 'number',
          },
        },
        required: ['commodity_id', 'count'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * create order
     *
     * @memberof OrderController
     * @return {promise} Order
     */
    async create() {
      this.ctx.userPermission();
      const params = await this.ctx.validate(this.createRule);

      const { ctx } = this.ctx.request;

      const commodity = await this.app.model.Commodity.findById(params.commodity_id);
      this.ctx.error(commodity, '商品不存在', 18001);
      this.ctx.error(
        commodity.status === this.app.model.Commodity.STATUS.ON,
        '商品已下架',
        18006,
      );

      /* istanbul ignore next */
      const order = await this.app.model.Order.create(Object.assign(
        {
          user_id: ctx.state.auth.user.id,
          commodity_price: commodity.realPrice,
        },
        params,
      ));
      this.ctx.jsonBody = order;
    }

    /**
     * 获取 orders 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get listRule() {
      return {
        properties: {
          from: this.ctx.helper.rule.date,
          to: this.ctx.helper.rule.date,
          status: {
            type: 'string',
            enum: ['CREATED', 'PAYED', 'SHIPMENT', 'FINISHED'],
          },
          order_no: { type: 'string' },
          ...this.ctx.helper.rule.pagination,
        },
        required: ['start', 'count', 'sort'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * list orders
     *
     * @memberof OrderController
     * @return {promise} Order List
     */
    async list() {
      // this.ctx.adminPermission();
      const query = await this.ctx.validate(
        this.listRule,
        this.ctx.helper.preprocessor.pagination,
      );
      const { count, start, sort } = query;
      /* istanbul ignore next */
      const {
        count: total,
        rows: items,
      } = await this.app.model.Order.findAndCount({
        where: _.pickBy({
          status: query.status,
          no: parseInt(query.order_no, 10),
          created_at:
            query.from || query.to
              ? _.pickBy({
                $gt: query.from ? new Date(query.from) : undefined,
                $lt: query.to ? new Date(query.to) : undefined,
              })
              : null,
        }),
        limit: count,
        offset: start,
        order: [['created_at', sort === 'false' ? 'DESC' : 'ASC']],
      });

      const rows = [];
      // eslint-disable-next-line
      for (let i = 0; i < items.length; i++) {
        const item = items[i].toJSON();
        const { name, phone, address } = await this.service.user.getByIdOrThrow(item.user_id); // eslint-disable-line
        const { quata } = await this.service.commodity.getByIdOrThrow(item.commodity_id); // eslint-disable-line

        Object.assign(item, {
          name,
          phone,
          address,
          quata: quata * item.count,
          index: (count * start) + i + 1,
        });
        rows.push(item);
      }
      this.ctx.jsonBody = _.pickBy(
        {
          count: total,
          start,
          rows,
        },
        x => !_.isNil(x),
      );
    }

    /**
     * 获取 order 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get fetchRule() {
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
     * fetch order
     *
     * @memberof OrderController
     * @return {promise} Order
     */
    async fetch() {
      const { ctx } = this;
      await ctx.validate(this.fetchRule);

      const order = await this.app.model.Order.findById(ctx.params.id);
      ctx.assert(order, 404);
      ctx.checkPermission(order.user_id);

      const result = { order };
      ctx.jsonBody = result;
    }

    /**
     * 修改 order 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get patchRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          price: { type: 'number', minimum: 0.01 },
          status: {
            type: 'string',
            enum: ['finished'],
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * patch order
     *
     * @memberof OrderController
     * @return {promise} Order
     */
    async patch() {
      const { ctx } = this;
      const params = await ctx.validate(this.patchRule);

      const order = await app.model.Order.findById(params.id);
      ctx.assert(order, 404);
      ctx.checkPermission(order.user_id);

      /* istanbul ignore next */
      if (params.price) {
        ctx.adminPermission();
        const trades = await app.model.Trade.count({
          where: { order_id: params.id },
        });
        ctx.error(trades === 0, '当前订单已发起支付，无法修改价格', 18007);
      }

      /* istanbul ignore next */
      if (params.status) {
        ctx.checkPermission(order.user_id);
        ctx.error(
          order.status === 'SHIPMENT',
          '订单当前状态不能修改为已完成',
          18003,
        );
        params.status = params.status.toUpperCase();
      }

      Object.assign(order, params);
      await order.save();

      ctx.jsonBody = order;
    }
  }
  return OrderController;
};
