'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;
  /**
   * Tracing
   *
   * @model Tracing
   * @namespace Model
   * @property {Array}   records                  - 溯源记录
   * @property {String}  record.courier           - 快递员
   * @property {String}  record.express_name      - 快递名称
   * @property {String}  record.express_no        - 快递单号
   * @property {Date}    record.express_at        - 快递时间
   *
   * @property {String}  record.reciver           - 收货时间
   * @property {String}  record.reciver_type      - 目标客户类型['consumer'、'business']
   * @property {Date}    record.recive_at         - 收货人
   *
   * @property {String}  record.sender            - 发货人
   * @property {Date}    record.send_at           - 卖给客户时间
   *
   * @property {Boolean} record.isToConsumer      - 是否发给客户
   * @property {Boolean} record.consumer          - 客户信息
   * @property {Boolean} record.consumer.name     - 客户名称
   * @property {Boolean} record.consumer.phone    - 客户电话
   * @property {Boolean} record.consumer.address  - 客户地址
   *
   * @property {String}  factory                  - 该溯源码所属厂家
   * @property {String}  owner                    - 当前溯源码拥有者
   * @property {String}  order                    - 所属订单
   * @property {Array}   products                 - 携带的商品信息
   * @property {String}  products.name            - 携带的商品名称
   * @property {String}  products.description     - 携带的商品描述
   * @property {String}  products.manufacturer    - 携带的商品制造商
   * @property {Array}   products.attributes      - 携带的商品属性
   * @property {Array}   tracing_products         - 溯源码商品
   * @property {String}  private_key              - 溯源码私匙
   * @property {String}  public_key               - 溯源码公匙
   * @property {Boolean} enable                   - 是否激活
   * @property {Boolean} isReceived               - 目标客户是否已签收
   * @property {Boolean} isEnd                    - 溯源流程结束
   * @property {Boolean} isFactoryTracing         - 是否为厂家溯源码
   */
  const schema = new Schema(
    {
      records: [
        {
          sender: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          send_at: Date,
          reciver: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          courier: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          express_name: String,
          express_no: String,
          express_at: Date,
          isToConsumer: {
            type: Boolean,
            default: true,
          },
          consumer: {
            name: String,
            phone: String,
            address: String,
          },
        },
      ],
      owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      order: {
        type: Schema.Types.ObjectId,
        ref: 'order',
      },
      products: [
        {
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          manufacturer: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          attributes: [
            {
              name: String,
              value: String,
            },
          ],
        },
      ],
      tracing_products: [
        {
          type: Schema.Types.ObjectId,
          ref: 'tracing',
        },
      ],
      private_key: String,
      public_key: String,
      enable: {
        type: Boolean,
        default: true,
      },
      isReceived: {
        type: Boolean,
        default: false,
      },
      isEnd: {
        type: Boolean,
        default: false,
      },
      isFactoryTracing: {
        type: Boolean,
        default: false,
      },
      deleted_at: Date,
    },
    Object.assign(
      {},
      {
        timestamps,
      }
    )
  );

  return mongoose.model('tracing', schema);
};
