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
   * 用户Model
   *
   * @model User
   * @namespace Model
   *
   * @param {Number}   role_type                       - 角色类型[business,salesman,courier,factroy,platform,unauthed]
   * @param {Integer}  role_id                         - 用户角色[10平台用户][20厂家][30各级经销商用户][40销售账户][50快递员][60普通未认证的用户]
   * @param {Object}   platform                        - 平台用户
   * @param {string}   platform.name                   - 平台用户【名称】
   * @param {string}   platform.email                  - 平台用户【邮箱】
   * @param {string}   platform.password               - 平台用户【密码】
   * @param {string}   platform.avatar                 - 平台用户【密码】
   * @param {Object}   business                        - 商家
   * @param {string}   business.name                   - 商家【名称】
   * @param {string}   business.public_account         - 商家【对公账户】
   * @param {string}   business.email                  - 商家【邮箱】
   * @param {string}   business.contact                - 商家【联系人】
   * @param {string}   business.phone                  - 商家【联系电话】
   * @param {string}   business.license                - 商家【营业执照】
   * @param {string}   business.receiving_info         - 商家【收获信息】
   * @param {String}   business.receiving_info.name    - 商家【收获信息】【收货人名称】
   * @param {String}   business.receiving_info.phone   - 商家【收获信息】【收货人手机号】
   * @param {String}   business.receiving_info.address - 商家【收获信息】【收货人地址】
   * @param {Object}   courier                         - 快递员
   * @param {String}   courier.company                 - 快递员【所属公司】
   * @param {String}   courier.name                    - 快递员【名称】
   * @param {String}   courier.phone                   - 快递员【电话】
   * @param {String}   courier.id_card                 - 快递员【身份证正面】
   * @param {String}   unionId                         - 微信用户唯一识别号
   * @param {Boolean}  enable                          - 是否启用该账户
   * @param {Date}     last_login                      - 上次登录时间
   * @param {Object}   inviter                         - 邀请者
   * @param {Object}   state                           - 商家状态[passed, rejected, unreview]
   * @param {Object}   inviter                         - 邀请者
   *
   *
   */

  const schema = new Schema({
    role_type: {
      type: String,
      enum: [
        'platform',
        'factory',
        'business',
        'courier',
        'salesman',
        'unauthed',
      ],
      default: 'unauthed',
    },
    role_id: {
      type: Number,
      default: 60,
    },
    // 平台用户
    platform: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    // 厂家
    factory: {
      name: {
        type: String,
      },
      public_account: {
        type: String,
      },
      email: {
        type: String,
      },
      contact: {
        type: String,
      },
      phone: {
        type: String,
      },
      license: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
      receiving_info: {
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
        address: {
          type: String,
        },
      },
    },
    // 商家
    business: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      phone: {
        type: String,
      },
      contact: {
        type: String,
      },
      banner: [{
        type: Schema.Types.ObjectId,
        ref: 'file',
      }],
    },
    // 快递员
    courier: {
      company: {
        type: String,
      },
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      employee_card: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
    },

    // 销售
    salesman: {
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      address: {
        type: String,
      },
      id_card: {
        type: Schema.Types.ObjectId,
        ref: 'file',
      },
    },
    openid: {
      type: String,
    },
    enable: {
      type: Boolean,
      default: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    state: {
      type: String,
      enum: [
        'passed', 'rejected', 'unreview',
      ],
      default: 'unreview',
    },
    rejectReason: {
      type: String,
    },
    last_login: Date,
    deleted_at: Date,
  },
  Object.assign({}, {
    timestamps,
  })
  );

  return mongoose.model('user', schema);
};
