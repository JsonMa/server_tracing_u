'use strict';

const {
  timestamps,
} = require('../lib/model_common');

module.exports = ({
  mongoose,
}) => {
  const {
    Schema,
  } = mongoose;
  /**
   * 订单Model
   *
   * @model Order
   * @namespace Model
   * @property {Enum}     status                 - 订单状态 ['CREATED-创建成功，待报价', 'QUOTED-已报价，待支付','ALL_PAYED-已支付，待发货', 'HALF_PAYED-已支付首款，待支付尾款', 'CLOSED','PRINTED', SHIPMENT-已发货，待签收', 'FINISHED-已签收']
   * @property {Object}   buyer                  - 用户信息
   * @property {Object}   salesman               - 销售信息
   * @property {Object}   quoter                 - 报价人
   * @property {Object}   commodity              - 商品信息
   * @property {int}      price                  - 商品总价格
   * @property {int}      count                  - 商品数量
   * @property {uuid}     no                     - 订单号
   * @property {Object}   express                - 快递信息
   * @property {String}   express.id             - 快递单号
   * @property {String}   express.name           - 快递公司名称
   * @property {Boolean}  needPrint              - 是否需要打印生成溯源码
   * @property {Boolean}  isStagePay             - 是否分期付款
   * @property {Object}   trade                  - 交易信息
   * @property {Object}   trade.type             - 付款类型【'FIRST_PAYED','LAST_PAYED','ALL_PAYED',】首付款/尾款/全款
   * @property {Object}   trade.sponsor          - 发起人账号
   * @property {Object}   trade.receiver         - 收款人账号
   * @property {Object}   trade.voucher          - 交易凭证
   * @property {Object}   trade.number           - 交易单号
   */
  const schema = new Schema({
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    salesman: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    quoter: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
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
    },
    needPrint: {
      type: Boolean,
      default: false,
    },
    isStagePay: {
      type: Boolean,
      default: false,
    },
    trade: [{
      type: {
        type: String,
        values: [
          'FIRST_PAYED',
          'ALL_PAYED',
        ],
      },
      sponsor: {
        type: 'string',
      },
      number: {
        type: 'string',
      },
      receiver: {
        type: 'string',
      },
      voucher: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
    }],
    deleted_at: Date,
  },
  Object.assign({}, {
    timestamps,
  })
  );

  return mongoose.model('order', schema);
};
