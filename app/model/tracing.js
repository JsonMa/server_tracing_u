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
   * Tracing
   *
   * @model Tracing
   * @namespace Model
   * @property {String}  no                - 溯源码编号
   * @property {String}  courier           - 快递员
   * @property {String}  reciver           - 收货人
   * @property {String}  sender            - 发货人
   * @property {Boolean} isToConsumer      - 是否发给客户
   * @property {String}  owner             - 当前溯源码拥有者
   * @property {String}  order             - 所属订单
   * @property {Array}   products          - 携带的商品信息
   * @property {Array}   tracing_products  - 溯源码商品
   * @property {String}  private_key       - 溯源码私匙
   * @property {String}  public_key        - 溯源码公匙
   * @property {String}  factroy_key       - 厂家溯源码公匙
   * @property {Boolean} enable            - 是否启用
   *
   */
  const schema = new Schema({
    no: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    reciver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    courier: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'order',
    },
    product: [{}],
    tracing_products: [{}],
    private_key: String,
    public_key: String,
    factroy_key: String,
    isToConsumer: {
      type: Boolean,
      default: true,
    },
    enable: {
      type: Boolean,
      default: true,
    },
    deleted_at: Date,
  },
  Object.assign({}, {
    timestamps,
  })
  );

  return mongoose.model('tracing', schema);
};
