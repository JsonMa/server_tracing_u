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
   * @property {String}  record.reciver_type      - 目标客户类型['consumer'、'business']
   * @property {String}  record.reciver           - 收货人
   * @property {Boolean} record.reciver_name      - 客户名称
   * @property {Boolean} record.reciver_phone     - 客户电话
   * @property {Boolean} record.reciver_address   - 客户地址
   * @property {Date}    record.recive_at         - 收货时间
   *
   * @property {String}  record.sender            - 发货人
   * @property {Date}    record.send_at           - 发货时间
   * @property {String}  factory                  - 该溯源码所属厂家
   * @property {String}  owner                    - 当前溯源码拥有者
   * @property {String}  order                    - 所属订单
   * @property {Array}   products                 - 携带的商品信息
   * @property {String}  products.name            - 携带的商品名称
   * @property {String}  products.description     - 携带的商品描述
   * @property {String}  products.manufacturer    - 携带的商品制造商
   * @property {Array}   products.attributes      - 携带的商品属性
   * @property {Array}   tracing_products         - 溯源码商品
   * @property {Array}   no                       - 溯源码编号
   * @property {String}  inner_code              - 溯源码私匙
   * @property {String}  outer_code               - 溯源码公匙
   * @property {Boolean} isActive                 - 是否激活
   * @property {Boolean} state                    - ['UNBIND-未绑定商品','BIND-已绑定商品','SEND-经销商已发货','EXPRESSED-快递已绑定快递信息','RECEIVED-客户已收货']
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
          reciver_type: {
            type: String,
            enum: ['consumer', 'business'],
          },
          reciver_name: String,
          reciver_phone: String,
          reciver_address: String,
          reciver_at: Date,
          courier: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
          express_name: String,
          express_no: String,
          express_at: Date,
        },
      ],
      owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      factory: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      order: {
        type: Schema.Types.ObjectId,
        ref: 'order',
      },
      products: [
        {
          type: Schema.Types.ObjectId,
          ref: 'barcode',
        },
      ],
      tracing_products: [
        {
          type: Schema.Types.ObjectId,
          ref: 'tracing',
        },
      ],
      no: String,
      private_uuid: String,
      public_uuid: String,
      inner_code: String,
      outer_code: String,
      isActive: {
        type: Boolean,
        default: false,
      },
      state: {
        type: String,
        enum: ['UNBIND', 'BIND', 'SEND', 'EXPRESSED', 'RECEIVED'],
        default: 'UNBIND',
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
