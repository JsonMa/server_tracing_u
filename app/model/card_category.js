module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    INTEGER,
    ARRAY,
  } = app.Sequelize;

    /**
     * 贺卡类型Model
     *
     * @model CardCategory
     * @namespace Model
     *
     * @property {uuid}    id
     * @property {number}  no               - 贺卡分类序列号
     * @property {string}  name             - 贺卡分类名称
     * @property {array}   background_ids   - 贺卡分类背景图
     * @property {array}   music_ids        - 贺卡分类音乐
     * @property {array}   blessings        - 贺卡分类祝福语
     */
  const CardCategory = app.model.define('card_category', {
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
    background_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
    music_ids: {
      type: ARRAY(UUID),
      allowNull: false,
      defaultValue: [],
    },
    blessings: {
      type: ARRAY(STRING(64)),
      allowNull: false,
      defaultValue: [],
    },
  });
  return CardCategory;
};

