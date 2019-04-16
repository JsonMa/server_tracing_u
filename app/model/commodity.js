module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    BOOLEAN,
    INTEGER,
    FLOAT,
    ENUM,
    ARRAY,
  } = app.Sequelize;

  /**
   * 商品Model
   *
   * @model Commodity
   * @namespace Model
   *
   * @property {uuid}    id
   * @property {number}  no             - 商品序列号
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
   */
  const Commodity = app.model.define('commodity', {
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
      allowNull: false,
    },
    description: STRING(500),
    price: {
      type: FLOAT,
      allowNull: false,
    },
    act_price: {
      type: FLOAT,
      allowNull: true,
    },
    sales: {
      type: INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    recommended: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    status: {
      type: ENUM,
      values: [
        'ON',
        'OFF',
      ],
      defaultValue: 'ON',
      allowNull: false,
    },
    category_id: {
      type: UUID,
      allowNull: false,
    },
    picture_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
    quata: {
      type: INTEGER,
      allowNull: true,
    },
  }, {
    getterMethods: {
      realPrice() {
        const price = this.getDataValue('price');
        const actPrice = this.getDataValue('act_price');

        return actPrice || price;
      },
    },
  });
  Commodity.STATUS = {
    ON: 'ON',
    OFF: 'OFF',
  };
  return Commodity;
};
