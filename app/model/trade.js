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
   * 交易Model
   *
   * @model Trade
   * @namespace Model
   * @property {uuid}     order_id - 内部订单号
   * @property {string}   trade_no - 外部订单号
   * @property {enum}     status   - 交易状态 ['PENDING', 'CLOSED', 'SUCCESS']
   * @property {string}   detail   - 支付详细信息, 序列化的JSON格式存储
   *
   */
  const schema = new Schema({
    order_id: {
      type: String,
      required: true,
    },
    trade_no: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CLOSED',
        'SUCCESS',
      ],
      required: true,
      default: 'PENDING',
    },
    detail: String,
  }, Object.assign({}, {
    timestamps,
  }));

  return mongoose.model('trade', schema);
};
