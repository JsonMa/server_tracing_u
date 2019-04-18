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
   * @property {Enum}     status                 - 订单状态 ['CREATED-创建成功，待报价', 'QUOTED-已报价，待支付','ALL_PAYED-已支付，待发货', 'HALF_PAYED-已支付首款，待支付尾款', 'CLOSED','SHIPMENT-已发货，待签收', 'FINISHED-已签收']
   * @property {Object}   user                   - 用户信息
   * @property {Object}   commodity              - 商品信息
   * @property {int}      price                  - 商品总价格
   * @property {int}      count                  - 商品数量
   * @property {uuid}     trade_id               - 交易单号
   * @property {Object}   express                - 快递信息
   * @property {String}   express.id             - 快递单号
   * @property {Object}   express.courier        - 快递员信息
   *
   */
  const schema = new Schema({
    user: {
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
      values: ['CREATED', 'QUOTED', 'HALF_PAYED', 'ALL_PAYED', 'SHIPPED', 'FINISHED', 'CLOSED'],
      defaultValue: 'CREATED',
    },
    trade_id: String,
    express: {
      id: String,
      courier: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    },
  }, Object.assign({}, {
    timestamps,
  }));

  return mongoose.model('order', schema);
};
