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
   * @property {uuid}    id
   * @property {string}  name           - 商品名
   * @property {string}  description    - 商品描述
   * @property {number}  price          - 商品价格
   * @property {number}  act_price      - 活动价格
   * @property {int}     sales          - 已卖出数量
   * @property {boolean} recommended    - 推荐
   * @property {enum}    status         - 上/下架状态['ON', 'OFF']
   * @property {uuid}    category_id    - 分类ID
   * @property {array}   picture_ids    - 商品图片ID
   * @property {int}     quata          - 二维码额度
   * @property {Array}   brands         - 标签
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
      recommended: {
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
