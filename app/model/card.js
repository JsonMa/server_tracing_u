module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    INTEGER,
    ENUM,
    JSONB,
  } = app.Sequelize;

  /**
   * 贺卡Model
   *
   * @model Card
   * @namespace Model
   *
   * @property {uuid}    id
   * @property {number}  no              - 贺卡序列号
   * @property {uuid}    voice_id        - 贺卡录音id
   * @property {uuid}    video_url       - 贺卡视频url
   * @property {uuid}    cover_id        - 贺卡视频封面id
   * @property {uuid}    blessing        - 祝福语
   * @property {uuid}    background_id   - 背景图 id
   * @property {uuid}    picture_id      - 照片id
   * @property {uuid}    user_id         - 商家id
   * @property {string}  union_id        - 顾客的唯一身份认证
   * @property {number}  click           - 点击数量
   * @property {uuid}    category_id     - 贺卡分类
   * @property {string}  status          - 贺卡状态['NONBLANK','BLANK']分别表示贺卡为空或者非空
   */
  const Card = app.model.define('card', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    no: {
      type: INTEGER,
      autoIncrement: true,
    },
    voice_id: {
      type: UUID,
      allowNull: true,
    },
    video_url: {
      type: STRING(128),
      allowNull: true,
    },
    cover_id: {
      type: UUID,
      allowNull: true,
    },
    blessing: {
      type: STRING,
      allowNull: true,
    },
    picture_id: {
      type: UUID,
      allowNull: true,
    },
    background_id: {
      type: UUID,
      allowNull: true,
    },
    user_id: {
      type: UUID,
      allowNull: false,
    },
    category_id: {
      type: UUID,
      allowNull: true,
    },
    union_id: {
      type: STRING(32),
      allowNull: true,
    },
    editor_info: {
      type: JSONB,
      allowNull: true,
    },
    click: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: ENUM,
      values: [
        'NONBLANK',
        'BLANK',
      ],
      defaultValue: 'BLANK',
      allowNull: false,
    },
  });
  return Card;
};

