module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    ARRAY,
  } = app.Sequelize;

  /**
   * 商品属性Model
   *
   * @model CommodityAttr
   * @namespace Model
   * @property {uuid}   id
   * @property {string} name           - 属性名
   * @property {array}  values         - 属性值
   * @property {uuid}   commodity_id   - 商品ID
   */
  const CommodityAttr = app.model.define('commodity_attr', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(20),
      allowNull: false,
    },
    values: {
      type: ARRAY(STRING(20)),
      allowNull: false,
      defaultValue: [],
    },
    commodity_id: {
      type: UUID,
      allowNull: false,
    },
  });

  return CommodityAttr;
};

