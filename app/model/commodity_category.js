'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;

  /**
   * 商品类型Model
   *
   * @model CommodityCategory
   * @namespace Model
   * @property {string}  name              - 分类名
   * @property {uuid}    description       - 分类描述
   * @property {uuid}    cover             - 分类描述
   * @property {boolean} auto_charge       - 是否有自动充值功能
   */
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: String,
      cover: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      auto_charge: {
        type: Boolean,
        default: false,
        required: true,
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

  return mongoose.model('commodity_category', schema);
};
