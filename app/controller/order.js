'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');

module.exports = app => {
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
          commodity: {
            $ref: 'schema.definition#/oid',
          },
          count: {
            type: 'number',
          },
          buyer: {
            $ref: 'schema.definition#/oid',
          },
          remarks: {
            type: 'string',
          },
        },
        required: ['commodity', 'count', 'buyer'],
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
      const { createRule, ctx } = this;

      const { commodity, count, buyer, remarks } = await ctx.verify(
        createRule,
        ctx.request.body
      );

      const isCommodityExited = await ctx.service.commodity.findById(commodity);
      ctx.error(isCommodityExited, 17001, '订单涉及的商品不存在');
      ctx.error(isCommodityExited.enable, 17002, '订单涉及的商品已下架');
      if (isCommodityExited.isCustom) {
        ctx.error(remarks, 17021, '定制商品需携带订单备注，注明尺寸信息');
      }

      const isUserExited = await ctx.service.user.findById(buyer);
      ctx.error(isUserExited, 17003, '商品购买者不存在');
      ctx.error(
        isUserExited.role_type === 'factory',
        17017,
        '该用户类型不具备购买权限'
      );

      const order = await ctx.service.order.create(
        Object.assign(ctx.request.body, {
          price: isCommodityExited.price * count,
          no: uuid(),
          needPrint: !!isCommodityExited.quata,
          status: isCommodityExited.isCustom ? 'CREATED' : 'QUOTED',
          isStagePay: isCommodityExited.isCustom,
          remarks,
          ...(isUserExited.inviter
            ? {
              salesman: isUserExited.inviter,
            }
            : {}),
        })
      );
      ctx.jsonBody = order;
    }

    /**
     * 获取 orders 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get indexRule() {
      return {
        properties: {
          status: {
            type: 'string',
            enum: [
              'CREATED',
              'QUOTED',
              'FIRST_PAYED',
              'ALL_PAYED',
              'PRINTED',
              'SHIPPED',
              'FINISHED',
            ],
          },
          buyer: {
            $ref: 'schema.definition#/oid',
          },
          salesman: {
            $ref: 'schema.definition#/oid',
          },
          quoter: {
            $ref: 'schema.definition#/oid',
          },
          embed: {
            type: 'string',
            enum: ['category'],
          },
          ...this.ctx.helper.pagination.rule,
        },
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
    async index() {
      const { ctx, indexRule } = this;

      const { generateSortParam } = ctx.helper.pagination;
      let respOrders = {
        unQuoted: [], // 待报价
        unPaid: [], // 待付款
        unSent: [], // 待发货
        unReceived: [], // 待收货
        all: [], // 所有订单
      };
      const {
        limit = 10,
        offset = 0,
        sort = '-created_at',
        embed,
      } = await ctx.verify(indexRule, ctx.request.query);

      const query = {};
      ['status', 'buyer', 'salesman', 'quoter'].forEach(key => {
        const item = ctx.request.query[key];
        if (item) query[key] = item;
      });
      const orders = await ctx.service.order.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'commodity buyer salesman quoter'
      );
      if (embed === 'category') {
        respOrders.all = orders;
        orders.forEach(order => {
          const { status, isStagePay } = order;
          switch (status) {
            case 'CREATED':
              if (isStagePay) respOrders.unQuoted.push(order);
              else respOrders.unPaid.push(order);
              break;
            case 'QUOTED':
              respOrders.unPaid.push(order);
              break;
            case 'HALF_PAYED':
              respOrders.unSent.push(order);
              break;
            case 'ALL_PAYED':
              respOrders.unSent.push(order);
              break;
            case 'SHIPMENT':
              respOrders.unReceived.push(order);
              break;
            default:
              break;
          }
        });
      } else respOrders = orders;
      const count = await ctx.service.order.count(query);

      ctx.jsonBody = {
        data: respOrders,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 获取order的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get showRule() {
      return {
        properties: {
          id: {
            $ref: 'schema.definition#/oid',
          },
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
    async show() {
      const { ctx, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);

      const order = await ctx.service.order.findById(
        id,
        'commodity buyer salesman quoter'
      );
      ctx.error(order, 17000, '订单不存在');
      ctx.jsonBody = order;
    }

    /**
     * 修改 order 的参数规则
     *
     * @readonly
     * @memberof OrderController
     */
    get updateRule() {
      return {
        properties: {
          id: {
            $ref: 'schema.definition#/oid',
          },
          quoter: {
            $ref: 'schema.definition#/oid',
          },
          price: {
            type: 'number',
          },
          stageProportion: {
            type: 'number',
          },
          tailPayment_at: {
            type: 'string',
            enum: ['BEFORE_EXPRESS', 'AFTER_EXPRESS'],
          },
          commisionProportion: {
            type: 'number',
          },
          express: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                $ref: 'schema.definition#/name',
              },
            },
            required: ['id', 'name'],
            additionalProperties: false,
            $async: true,
          },
          status: {
            type: 'string',
            enum: [
              'CREATED',
              'QUOTED',
              'FIRST_PAYED',
              'ALL_PAYED',
              'PRINTED',
              'SHIPPED',
              'FINISHED',
              'CLOSED',
              'PAYMENT_CONFIRMED',
            ],
          },
          trade: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['FIRST_PAYED', 'ALL_PAYED'],
                },
                sponsor: {
                  type: 'string',
                },
                number: {
                  type: 'string',
                },
                voucher: {
                  $ref: 'schema.definition#/oid',
                },
              },
              required: ['type', 'sponsor', 'number', 'voucher'],
              additionalProperties: false,
              $async: true,
            },
          },
          isFirstPaymentConfirmed: {
            type: 'boolean',
          },
          isAllPaymentConfirmed: {
            type: 'boolean',
          },
        },
        required: ['id', 'status'],
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
    async update() {
      const { ctx, updateRule } = this;
      const {
        id,
        trade,
        price,
        quoter,
        express,
        status,
        stageProportion,
        tailPayment_at,
        commisionProportion,
        isFirstPaymentConfirmed,
        isAllPaymentConfirmed,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );

      const isOrderExit = await ctx.service.order.findById(id, 'commodity');
      ctx.error(isOrderExit, 17000, '订单不存在');
      const modifiedData = {
        needRemind: false,
      };

      // 报价
      if (status === 'QUOTED') {
        ctx.error(!!price, 400, '参数错误，未上传报价信息', 400);
        ctx.error(!!stageProportion, 400, '参数错误，未上传分期比例', 400);
        ctx.error(!!tailPayment_at, 400, '参数错误，未上传尾款时间', 400);
        ctx.error(!!commisionProportion, 400, '参数错误，未携带佣金比例', 400);
        ctx.error(
          !!isOrderExit.commodity.isCustom,
          17006,
          '非订制商品，不可报价'
        );
        ctx.error(quoter, 400, '参数错误，报价人为必填项', 400);
        // TODO校验当前用户是否有报价权限
        const isQuoterExit = await ctx.service.user.findById(quoter);
        ctx.error(isQuoterExit, 17004, '报价人不存在');
        ctx.error(
          ['platform'].includes(isQuoterExit.role_type),
          17005,
          '该用户没有报价权限'
        );
        ctx.error(
          ['CREATED', 'QUOTED'].includes(isOrderExit.status),
          17007,
          '修改报价失败，订单已支付款项'
        );
        Object.assign(modifiedData, {
          price,
          stageProportion,
          tailPayment_at,
          commisionProportion,
          quoter,
          status,
          needRemind: true,
          quote_at: new Date(),
        });
      } else if (['FIRST_PAYED', 'ALL_PAYED'].includes(status)) {
        // TODO 校验当前用户是否有付款或核收权限
        ctx.error(!_.isEmpty(trade), 400, '未携带支付信息', 400);
        ctx.error(
          ['QUOTED', 'FIRST_PAYED', 'ALL_PAYED'].includes(isOrderExit.status),
          17008,
          '上传支付凭据失败，订单已生成鉴权码或已发货'
        );
        if (isOrderExit.status === 'ALL_PAYED') {
          ctx.error(
            status === 'FIRST_PAYED',
            17010,
            '修改订单状态失败,当前订单已支付完成'
          );
        }

        // 过滤输入trade数据
        for (let i = 0; i < trade.length; i++) {
          const isVoucherExit = await ctx.service.file.findById(
            trade[i].voucher
          );
          ctx.error(isVoucherExit, 17008, '未找到打款凭据截图');
        }
        const tradeFilter = {};
        if (isOrderExit.isStagePay) {
          // 分期支付
          if (status === 'ALL_PAYED') {
            ctx.error(
              trade.length === 2,
              17011,
              '支付只能分两期支付，请检查支付信息'
            );
            trade.forEach(item => {
              if (Reflect.has(tradeFilter, item.type)) {
                ctx.error(false, 17012, '交易信息重复，请检查交易信息');
              } else tradeFilter[item.type] = true;
            });
            ctx.error(
              Object.keys(tradeFilter).includes(status),
              17013,
              '订单状态与交易信息不匹配'
            );
            trade[1].pay_at = new Date();
          } else {
            ctx.error(trade.length === 1, 17014, '首付款只能包含单条交易内容');
            ctx.error(
              trade[0].type === 'FIRST_PAYED',
              17013,
              '订单状态与交易信息不匹配'
            );
            trade[0].pay_at = new Date();
          }
        } else {
          // 全款支付
          ctx.error(
            status === 'ALL_PAYED' && trade.length === 1,
            17009,
            '非定制商品只能全价支付订单'
          );
          ctx.error(
            trade[0].type === 'ALL_PAYED',
            17009,
            '非定制商品只能全价支付订单'
          );
          trade[0].pay_at = new Date();
        }
        Object.assign(modifiedData, {
          trade,
          status,
        });
      } else if (status === 'PAYMENT_CONFIRMED') {
        ctx.error(
          ['FIRST_PAYED', 'ALL_PAYED'].includes(isOrderExit.status),
          17018,
          '支付确认失败，当前订单未处于已支付状态'
        );
        ctx.error(
          isOrderExit.trade.length,
          17018,
          '支付确认失败，当前订单未处于已支付状态'
        );
        if (isOrderExit.status === 'FIRST_PAYED') {
          Object.assign(modifiedData, {
            status,
            isFirstPaymentConfirmed,
            firstPaymentConfirm_at: new Date(),
          });
        } else {
          Object.assign(modifiedData, {
            status,
            isAllPaymentConfirmed,
            allPaymentConfirm_at: new Date(),
          });
        }
      } else if (status === 'SHIPPED') {
        // TODO 操作权限，用户类型必须为platform
        // 验证当前是否为已支付状态，是则进入发货流程
        if (isOrderExit.isStagePay) {
          if (isOrderExit.tailPayment_at === 'BEFORE_EXPRESS') {
            ctx.error(
              isOrderExit.isAllPaymentConfirmed,
              17018,
              '未确认尾款信息，不能发货'
            );
          } else {
            ctx.error(
              isOrderExit.isFirstPaymentConfirmed,
              17019,
              '未确认首付款信息，不能发货'
            );
          }
        } else {
          ctx.error(
            isOrderExit.isAllPaymentConfirmed,
            17020,
            '未确认收款信息，不能发货'
          );
        }
        ctx.error(express, 400, '未携带快递信息', 400);
        ctx.error(
          isOrderExit.status === 'ALL_PAYED',
          17008,
          '发货失败，订单未支付'
        );
        express.send_at = new Date();
        Object.assign(modifiedData, {
          express,
          status,
          needRemind: true,
        });

        // 修改商品已出售数量
        const { sales, _id: commodityId, payers } = isOrderExit.commodity;
        const { nModified } = await ctx.service.commodity.update(
          {
            _id: commodityId,
          },
          {
            sales: sales + isOrderExit.count,
            payers: payers + 1,
          }
        );
        ctx.error(nModified === 1, 15005, '商品修改失败');
      } else {
        // 收货
        if (status === 'PRINTED') {
          ctx.error(
            ['FIRST_PAYED', 'ALL_PAYED'].includes(status),
            17008,
            '打印失败，订单未支付'
          );
          Object.assign(modifiedData, {
            status,
            print_at: new Date(),
          });
        }
        if (status === 'FINISHED') {
          ctx.error(
            isOrderExit.status === 'SHIPPED',
            17008,
            '收货失败，订单未发货'
          );
          Object.assign(modifiedData, {
            status,
            finish_at: new Date(),
          });
        }
      }
      const { nModified } = await ctx.service.order.update(
        {
          _id: id,
        },
        modifiedData
      );
      ctx.error(nModified === 1, 17008, '订单修改失败');

      Object.assign(isOrderExit, modifiedData);
      ctx.jsonBody = isOrderExit;
    }

    /**
     * destroy order
     *
     * @memberof OrderController
     * @return {promise} Order
     */
    async destroy() {
      const { ctx, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);

      const order = await ctx.service.order.findById(id);
      ctx.error(order, 17000, '订单不存在');
      ctx.error(
        ['CREATED', 'QUOTED'].includes(order.status),
        17015,
        '订单删除失败，已支付订单款项'
      );
      const { nModified } = await ctx.service.order.destroy({
        _id: id,
      });
      ctx.error(nModified === 1, 17016, '订单删除失败');
      ctx.jsonBody = order;
    }
  }
  return OrderController;
};
