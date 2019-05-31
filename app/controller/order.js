'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');

module.exports = app => {
  /**
   * Order相关路由
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
          logo: {
            $ref: 'schema.definition#/oid',
          },
        },
        required: ['commodity', 'count'],
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
      // 若为非注册过的用户，则先邀请注册为企业账户
      const { createRule, ctx } = this;
      const { role_type, user_id } = ctx.checkPermission([
        'salesman',
        'factory',
      ]);
      const { commodity, count, remarks, logo } = await ctx.verify(
        createRule,
        ctx.request.body
      );
      let buyer = ctx.request.body.buyer;
      if (role_type === 'factory') buyer = user_id; // 如果是厂家，则买家就是自己
      const isCommodityExited = await ctx.service.commodity.findById(commodity);
      ctx.error(isCommodityExited, 17001, '订单涉及的商品不存在');
      ctx.error(isCommodityExited.enable, 17002, '订单涉及的商品已下架');
      if (isCommodityExited.isCustom) {
        ctx.error(remarks, 17021, '定制商品需携带订单备注，注明尺寸信息');
      }
      if (logo) {
        const isLogoExist = await ctx.service.file.findById(logo);
        ctx.error(isLogoExist, 17023, '订单涉及的logo文件不存在');
      }
      const isUserExited = await ctx.service.user.findById(buyer);
      ctx.error(
        isUserExited && isUserExited.state === 'passed',
        17003,
        '商品购买者不存在'
      );
      ctx.error(
        isUserExited.role_type === 'factory',
        17017,
        '该用户类型不具备购买权限'
      );
      if (role_type === 'salesman') {
        ctx.error(
          isUserExited.inviter === user_id,
          17022,
          '购买者非通过该账号邀请注册，请核对购买人信息'
        );
      }

      const order = await ctx.service.order.create(
        Object.assign(ctx.request.body, {
          price: isCommodityExited.price * count,
          no: uuid(),
          needPrint: !!isCommodityExited.quata,
          status: isCommodityExited.isCustom ? 'CREATED' : 'QUOTED',
          isStagePay: isCommodityExited.isCustom,
          remarks,
          buyer,
          ...(isUserExited.inviter
            ? {
              salesman: isUserExited.inviter,
            }
            : {}),
          ...(logo
            ? {
              logo,
            }
            : {}),
        })
      );
      ctx.jsonBody = order;
    }

    /**
     * 获取orders的参数规则
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
      const { user_id, role_type } = ctx.checkPermission([
        'salesman',
        'factory',
        'platform',
      ]);
      const { generateSortParam } = ctx.helper.pagination;
      let respOrders = {
        unQuoted: [], // 待报价
        unPaid: [], // 待付款
        unSent: [], // 待发货
        unCheck: [], // 待验收
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
      // 过滤订单
      if (role_type === 'salesman') query.salesman = user_id;
      else if (role_type === 'factory') query.buyer = user_id;
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
            case 'FIRST_PAYED':
              respOrders.unCheck.push(order);
              break;
            case 'FINISHED':
              if (order.isLastPayed && !order.isLastPaymentConfirmed) {
                respOrders.unCheck.push(order);
              }
              break;
            case 'ALL_PAYED':
              respOrders.unCheck.push(order);
              break;
            case 'PAYMENT_CONFIRMED':
              respOrders.unSent.push(order);
              break;
            case 'SHIPPED':
              respOrders.unReceived.push(order);
              break;
            default:
              break;
          }
        });
      } else respOrders = orders;
      const count = await ctx.service.order.count(query);
      if (['salesman', 'factory'].includes(role_type)) {
        delete respOrders.unCheck;
      }
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
      const { user_id, role_type } = ctx.checkPermission([
        'salesman',
        'factory',
        'platform',
      ]);
      const order = await ctx.service.order.findById(
        id,
        'commodity buyer salesman quoter'
      );
      if (['salesman', 'factory'].includes(role_type)) {
        if (role_type === 'factory') {
          ctx.error(
            order.buyer._id.toString() === user_id,
            17024,
            '该用户无权查看该订单详情'
          );
        } else {
          if (order.salesman) {
            ctx.error(
              order.salesman._id.toString() === user_id,
              17024,
              '该用户无权查看该订单详情'
            );
          }
        }
      }
      ctx.error(order, 17000, '订单不存在');
      ctx.jsonBody = order;
    }

    /**
     * 修改order的参数规则
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
          isLastPaymentConfirmed: {
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
      const { role_type, user_id } = ctx.checkPermission([
        'factory',
        'platform',
      ]);
      const {
        id,
        trade,
        price,
        express,
        status,
        stageProportion,
        commisionProportion,
        isFirstPaymentConfirmed,
        isAllPaymentConfirmed,
        isLastPaymentConfirmed,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );

      const isOrderExit = await ctx.service.order.findById(id, 'commodity');
      ctx.error(isOrderExit, 17000, '订单不存在');
      // 买家修改订单
      if (role_type === 'factory') {
        ctx.oneselfPermission(isOrderExit.buyer._id.toString());
      }
      const modifiedData = {
        needRemind: false,
      };

      // 报价
      if (status === 'QUOTED') {
        const quoter = user_id;
        ctx.checkPermission('platform');
        ctx.error(!!price, 400, '参数错误，未上传报价信息', 400);
        ctx.error(!!stageProportion, 400, '参数错误，未上传分期比例', 400);
        ctx.error(!!commisionProportion, 400, '参数错误，未携带佣金比例', 400);
        ctx.error(
          !!isOrderExit.commodity.isCustom,
          17006,
          '非订制商品，不可报价'
        );
        ctx.error(
          ['CREATED', 'QUOTED'].includes(isOrderExit.status),
          17007,
          '修改报价失败，订单已支付款项'
        );
        Object.assign(modifiedData, {
          price,
          stageProportion,
          commisionProportion,
          quoter,
          status,
          needRemind: true,
          quote_at: new Date(),
        });
      } else if (['FIRST_PAYED', 'ALL_PAYED'].includes(status)) {
        ctx.error(!_.isEmpty(trade), 400, '未携带支付信息', 400);
        ctx.error(
          ['QUOTED', 'FIRST_PAYED'].includes(isOrderExit.status),
          17008,
          '当前订单状态无法上传支付凭据'
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
        ctx.checkPermission('platform');
        ctx.error(
          ['FIRST_PAYED', 'ALL_PAYED'].includes(isOrderExit.status),
          17018,
          '支付确认失败，当前订单未处于已支付状态'
        );
        ctx.error(
          isOrderExit.trade.length > 0,
          17018,
          '支付确认失败，当前订单未处于已支付状态'
        );
        if (isOrderExit.status === 'FIRST_PAYED') {
          Object.assign(modifiedData, {
            status,
            isFirstPaymentConfirmed,
            firstPaymentConfirm_at: new Date(),
          });
        } else if (isOrderExit.isLastPayed) {
          Object.assign(modifiedData, {
            isLastPaymentConfirmed,
            lastPaymentConfirm_at: new Date(),
          });
        } else {
          Object.assign(modifiedData, {
            status,
            isAllPaymentConfirmed,
            allPaymentConfirm_at: new Date(),
          });
        }
      } else if (status === 'SHIPPED') {
        ctx.checkPermission('platform');
        ctx.error(
          isOrderExit.status === 'PAYMENT_CONFIRMED',
          17008,
          '发货失败，订单未核收'
        );
        ctx.error(express, 400, '未携带快递信息', 400);
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
      } else if (status === 'FINISHED') {
        ctx.error(
          isOrderExit.status === 'SHIPPED',
          17008,
          '收货失败，订单未发货'
        );
        if (isOrderExit.isStagePay) {
          ctx.error(trade && trade.length === 1, 17008, '交易信息有误');
          trade[0].pay_at = new Date();
          isOrderExit.trade.push(trade[0]);
          modifiedData.isLastPayed = true; // 已支付尾款
          modifiedData.trade = isOrderExit.trade;
        }
        Object.assign(modifiedData, {
          status,
          finish_at: new Date(),
        });
      } else {
        ctx.error(false, 17025, '错误的订单状态');
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
        ['CREATED'].includes(order.status),
        17015,
        '订单删除失败，当前状态不允许删除'
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
