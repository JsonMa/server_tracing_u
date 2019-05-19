'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;

  /**
   * 商品Model
   *
   * @model Commodity
   * @namespace Model
   *
   * @property {String}  name           - 商品名
   * @property {String}  description    - 商品描述
   * @property {Number}  price          - 商品价格
   * @property {Number}  act_price      - 活动价格
   * @property {Number}  sales          - 已卖出数量
   * @property {Number}  payers         - 购买人数量
   * @property {Boolean} recommend      - 是否推荐【默认不推荐】
   * @property {Boolean} enable         - 是否启用【默认启用】
   * @property {String}  category       - 分类ID
   * @property {Array}   pictures       - 商品图片ID
   * @property {Number}  quata          - 溯源码额度
   * @property {String}  brands         - 标签
   * @property {Boolean} isCustom       - 是否为定制商品【默认为非定制商品】
   */
  const schema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      description: String,
      price: {
        type: Number,
        required: true,
      },
      act_price: {
        type: Number,
        required: true,
      },
      sales: {
        type: Number,
        default: 0,
        required: true,
      },
      payers: {
        type: Number,
        default: 0,
        required: true,
      },
      recommend: {
        type: Boolean,
        default: false,
      },
      enable: {
        type: Boolean,
        default: true,
        required: true,
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'commodity_category',
      },
      pictures: [
        {
          type: Schema.Types.ObjectId,
          ref: 'file',
        },
      ],
      quata: {
        type: Number,
        default: 0,
        required: true,
      },
      isCustom: {
        type: Boolean,
        default: false,
      },
      brands: String,
      deleted_at: Date,
    },
    Object.assign(
      {},
      {
        timestamps,
      }
    )
  );

  return mongoose.model('commodity', schema);
};
