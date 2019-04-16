module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    ENUM,
    STRING,
  } = app.Sequelize;

    /**
     * banner
     *
     * @model Banner
     * @namespace Model
     * @property {uuid}   id
     * @property {uuid}   cover_id  - 视频封面图
     * @property {uuid}   video_url - 视频内容
     * @property {uuid}   status    - 商家状态['ON', 'OFF']，分别表示开启和关闭
     */
  const Banner = app.model.define('banner', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    cover_id: {
      type: UUID,
      allowNull: false,
    },
    video_url: {
      type: STRING(128),
      allowNull: false,
    },
    status: {
      type: ENUM,
      values: [
        'ON',
        'OFF',
      ],
      defaultValue: 'OFF',
      allowNull: false,
    },
  });

  return Banner;
};

