'use strict';

const { timestamps } = require('../lib/model_common');

module.exports = ({ mongoose }) => {
  const { Schema } = mongoose;
  /**
   * 条形码
   *
   * @model Barcode
   * @namespace Model
   * @property {String} barcode      - 条形码
   * @property {String} name         - 商品名称
   * @property {String} description  - 商品描述
   * @property {Array}  attributes   - 商品属性
   * @property {String} manufacturer - 制造商
   * @property {String} creator      - 创建人
   * @property {String} image        - 图片
   */
  const schema = new Schema(
    {
      barcode: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      manufacturer: {
        type: String,
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      image: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      attributes: [
        {
          name: String,
          value: String,
        },
      ],
      deleted_at: Date,
    },
    Object.assign(
      {},
      {
        timestamps,
      }
    )
  );

  return mongoose.model('barcode', schema);
};
