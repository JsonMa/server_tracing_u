'use strict';

const {
  timestamps
} = require('../lib/model_common');

module.exports = ({
  mongoose
}) => {
  const {
    Schema
  } = mongoose;
  /**
   * 条形码
   *
   * @model Barcode
   * @namespace Model
   * @property {String} name - 文件名称
   * @property {String} path - 文件路径
   * @property {String} type - 文件类型
   * @property {Number} size - 文件大小
   */
  const schema = new Schema({
      name: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      deleted_at: Date,
    },
    Object.assign({}, {
      timestamps,
    })
  );

  return mongoose.model('barcode', schema);
};
