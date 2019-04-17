const {
  timestamps
} = require('../lib/model_common')

module.exports = ({
  mongoose
}) => {
  const {
    Schema
  } = mongoose

  /**
   * 用户Model
   *
   * @model User
   * @namespace Model
   *
   * @param {uuid}    id
   * @param {enum}    status         - 商家状态['ON', 'OFF']
   * @param {enum}    role           - 用户角色[1,2]分别代表系统管理员、商家
   * @param {string}  password       - 密码,md5加密后的值
   * @param {number}  jump_num       - 公众号跳转数量(二维码下载次数)
   * @param {number}  no             - 商家序列号
   * @param {string}  name           - 商家名
   * @param {string}  address        - 商家地址
   * @param {string}  phone          - 联系人
   * @param {uuid}    avatar_id      - 商家logo id
   * @param {array}   picture_ids    - 产品图ids
   * @param {string}  url            - 公众号二维码 id
   * @param {Object}  receiving_info - 收货信息
   * @param {String} receiving_info.name - 收货人名称
   * @param {String} receiving_info.phone - 收货人手机号
   * @param {String} receiving_info.address - 收货人地址
   */

  const schema = new Schema({
    id: String,
    nickname: {
      type: String
    },
    email: String,
    password: String,
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'file'
    },

    personal: {
      sex: {
        type: String,
        enum: ['MALE', 'FEMALE']
      },
      birthday: Date,
      mobile_model: String
    },
    last_login: Date
  }, Object.assign({}, {
    timestamps
  }))

  return mongoose.model('account_app', schema)
}