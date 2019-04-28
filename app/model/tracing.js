// 'use strict';

// const {
//   timestamps
// } = require('../lib/model_common');

// module.exports = ({
//   mongoose
// }) => {
//   const {
//     Schema
//   } = mongoose;
//   /**
//    * Tracing
//    *
//    * @model Tracing
//    * @namespace Model
//    * @property {String}  no                - 溯源码编号
//    * @property {String}  courier           - 快递员
//    * @property {String}  reciver           - 收货人
//    * @property {String}  sender            - 发货人
//    * @property {Boolean} isToConsumer      - 是否发给客户
//    * @property {String}  owner             - 当前溯源码拥有者
//    * @property {String}  factroy           - 厂家
//    * @property {String}  business          - 销售
//    * @property {Array}   products          - 携带的商品信息
//    * @property {Array}   tracing_products  - 溯源码商品
//    * @property {String}  private_key       - 溯源码私匙
//    * @property {String}  public_key        - 溯源码公匙
//    * @property {String}  factroy_key       - 厂家溯源码公匙
//    * @property {Boolean} enable            - 是否启用
//    *
//    */
//   const schema = new Schema({
//       no: {
//         type: String,
//         required: true,
//       },
//       courier: {
//         type: Schema.Types.ObjectId,
//         ref: 'user',
//       },
//       type: {
//         type: String,
//         required: true,
//       },
//       size: {
//         type: Number,
//         required: true,
//       },
//       deleted_at: Date,
//     },
//     Object.assign({}, {
//       timestamps,
//     })
//   );

//   return mongoose.model('tracing', schema);
// };
