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
   * banner
   *
   * @model Banner
   * @namespace Model
   * @property {Object}    cover     - 视频封面图
   * @property {String}    video_url - 视频内容
   * @property {String}    title     - 标题
   * @property {String}    content   - 内容
   * @property {Boolean}   enable    - 是否启用
   */

  const schema = new Schema({
    cover: {
      type: Schema.Types.ObjectId,
      ref: 'file',
    },
    title: String,
    content: String,
    video_url: {
      type: String,
    },
    enable: {
      type: Boolean,
      defalut: true,
    },
  },
  Object.assign({}, {
    timestamps,
  }));

  return mongoose.model('banner', schema);
};
