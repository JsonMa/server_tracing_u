'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;
  /**
   * 订单Model
   *
   * @model Order
   * @namespace Model
   * @property {Enum}     status                 - 订单状态 ['CREATED-创建成功，待报价', 'QUOTED-已报价，待支付','FIRST_PAYED-已支付首款，待支付尾款', 'ALL_PAYED-已支付，待确认', 'PAYMENT_CONFIRMED'-已确认，待发货，'CLOSED','PRINTED', SHIPPED-已发货，待签收', 'FINISHED-已签收']
   * @property {Object}   buyer                  - 购买者信息
   * @property {Object}   logo                   - 购买者logo
   * @property {Object}   salesman               - 销售信息
   * @property {Object}   quoter                 - 报价人
   * @property {Date}     quote_at               - 报价时间
   * @property {Object}   commodity              - 商品信息
   * @property {int}      price                  - 商品总价格
   * @property {int}      count                  - 商品数量
   * @property {uuid}     no                     - 订单号
   * @property {Object}   express                - 快递信息
   * @property {String}   express.id             - 快递单号
   * @property {String}   express.name           - 快递公司名称
   * @property {String}   express.send_at        - 发货时间
   * @property {Boolean}  needPrint              - 是否需要打印生成溯源码
   * @property {Boolean}  isStagePay             - 是否分期付款
   * @property {Number}   stageProportion        - 分期比例
   * @property {Number}   commisionProportion    - 佣金比例
   * @property {Object}   payee                  - 收款人信息
   * @property {String}   payee.account          - 收款人银行账号
   * @property {String}   payee.bank             - 收款人银行名称
   * @property {String}   payee.name             - 收款人名称
   * @property {Object}   trade                  - 交易信息
   * @property {Object}   trade.type             - 付款类型【'FIRST_PAYED','ALL_PAYED',】首付款/全款
   * @property {Object}   trade.sponsor          - 发起人账号
   * @property {Object}   trade.voucher          - 交易凭证
   * @property {Object}   trade.number           - 交易单号
   * @property {Date}     trade.pay_at           - 付款时间
   * @property {Boolean}  isFirstPaymentConfirmed- 首付款核收
   * @property {Boolean}  firstPaymentConfirm_at - 首付款核收时间
   * @property {Boolean}  isAllPaymentConfirmed  - 全款核收
   * @property {Boolean}  allPaymentConfirm_at   - 全款核收时间
   * @property {Date}     trade.pay_at           - 付款时间
   * @property {Boolean}  needRemind             - 是否需要提醒买方已报价/已发货
   * @property {Boolean}  print_at               - 溯源码打印时间
   * @property {Date}     finish_at              - 订单结束时间
   * @property {String}   reason                 - 删除原因
   * @property {String}   remarks                - 订单备注[定制商品需要备注长宽高及厚度]
   */
  const schema = new Schema(
    {
      buyer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      logo: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      salesman: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      quoter: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      quote_at: Date,
      commodity: {
        type: Schema.Types.ObjectId,
        ref: 'commodity',
      },
      count: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        values: [
          'CREATED',
          'QUOTED',
          'FIRST_PAYED',
          'ALL_PAYED',
          'PAYMENT_CONFIRMED',
          'PRINTED',
          'SHIPPED',
          'FINISHED',
        ],
        default: 'CREATED',
      },
      no: String,
      express: {
        id: String,
        name: String,
        send_at: Date,
      },
      needPrint: {
        type: Boolean,
        default: false,
      },
      isStagePay: {
        type: Boolean,
        default: false,
      },
      stageProportion: {
        type: Number,
        default: 0.5,
      },
      commisionProportion: {
        type: Number,
        default: 0,
      },
      payee: {
        account: {
          type: String,
          default: '755942248610701',
        },
        bank: {
          type: String,
          default: '招商银行',
        },
        name: {
          type: String,
          default: '溯源科技',
        },
      },
      needRemind: {
        type: Boolean,
        default: false,
      },
      trade: [
        {
          type: {
            type: String,
            values: ['FIRST_PAYED', 'ALL_PAYED'],
          },
          sponsor: {
            type: String,
          },
          number: {
            type: String,
          },
          voucher: {
            type: Schema.Types.ObjectId,
            ref: 'file',
          },
          pay_at: Date,
        },
      ],
      isFirstPaymentConfirmed: {
        type: Boolean,
        default: false,
      },
      firstPaymentConfirm_at: Date,
      isAllPaymentConfirmed: {
        type: Boolean,
        default: false,
      },
      allPaymentConfirm_at: Date,
      print_at: Date,
      finish_at: Date,
      deleted_at: Date,
      reason: String,
    },
    Object.assign(
      {},
      {
        timestamps,
      }
    )
  );

  return mongoose.model('order', schema);
};
