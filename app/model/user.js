module.exports = (app) => {
  const {
    UUID, UUIDV1, STRING, INTEGER, ENUM, ARRAY, JSONB,
  } = app.Sequelize;

  /**
   * 用户Model
   *
   * @model User
   * @namespace Model
   *
   * @property {uuid}    id
   * @property {number}  no             - 商家序列号
   * @property {string}  name           - 商家名
   * @property {string}  address        - 商家地址
   * @property {string}  phone          - 联系人
   * @property {uuid}    avatar_id      - 商家logo id
   * @property {array}   picture_ids    - 产品图ids
   * @property {string}  url            - 公众号二维码 id
   * @property {enum}    status         - 商家状态['ON', 'OFF']
   * @property {enum}    cooperation    - 是否为合作伙伴['TRUE', 'FALSE']
   * @property {enum}    role           - 用户角色[1,2]分别代表系统管理员、商家
   * @property {string}  password       - 密码,md5加密后的值
   * @property {number}  card_num       - 贺卡剩余数量
   * @property {number}  card_total     - 贺卡总数
   * @property {number}  jump_num       - 公众号跳转数量(二维码下载次数)
   */
  const User = app.model.define('user', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    no: {
      type: INTEGER,
      autoIncrement: true,
    },
    name: {
      type: STRING(20),
      allowNull: true,
    },
    contact: {
      type: STRING(20),
      allowNull: true,
    },
    address: {
      type: JSONB,
      allowNull: true,
    },
    phone: {
      type: STRING(32),
      allowNull: false,
    },
    password: {
      type: STRING(64),
      allowNull: false,
    },
    avatar_id: {
      type: UUID,
      allowNull: true,
    },
    card_num: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jump_num: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    card_total: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    picture_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
    url: {
      type: UUID,
      allowNull: true,
    },
    status: {
      type: ENUM,
      values: ['ON', 'OFF'],
      defaultValue: 'ON',
      allowNull: false,
    },
    cooperation: {
      type: ENUM,
      values: ['TRUE', 'FALSE'],
      defaultValue: 'FALSE',
      allowNull: false,
    },
    role: {
      type: ENUM,
      values: ['1', '2'],
      defaultValue: '2',
      allowNull: false,
    },
  });
  return User;
};
