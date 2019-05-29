'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;
  /**
   * Counterfeit
   *
   * @model Counterfeit
   * @namespace Model
   * @property {String}  tracing         - 溯源码
   * @property {String}  barcode         - 条形码
   * @property {String}  sender          - 发货人
   * @property {String}  factory         - 制造商
   * @property {String}  image           - 假货截图
   * @property {String}  description     - 假货描述
   * @property {String}  phone           - 报警人电话
   * @property {Strinng} state           - 当前状态[未处理UNHANDLED 已处理RESOLVED]
   * @property {Strinng} handler         - 处理人
   * @property {Strinng} result          - 处理结果
   * @property {Strinng} handle_at       - 处理时间
   */
  const schema = new Schema(
    {
      tracing: {
        type: Schema.Types.ObjectId,
        ref: 'tracing',
      },
      barcode: {
        type: Schema.Types.ObjectId,
        ref: 'barcode',
      },
      factory: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      image: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      description: String,
      phone: String,
      state: {
        type: String,
        enum: ['UNHANDLED', 'RESOLVED'],
        default: 'UNHANDLED',
      },
      handler: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      result: String,
      handle_at: Date,
      deleted_at: Date,
    },
    Object.assign(
      {},
      {
        timestamps,
      }
    )
  );

  return mongoose.model('counterfeit', schema);
};
