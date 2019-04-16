module.exports = (app) => {
  const {
    UUID,
    UUIDV1,
    STRING,
    INTEGER,
  } = app.Sequelize;

  /**
   * 文件
   *
   * @model File
   * @namespace Model
   * @property {uuid}   id
   * @property {string} name - 文件名称
   * @property {string} path - 文件路径
   * @property {string} type - 文件类型
   * @property {string} size - 文件大小
   */
  const File = app.model.define('file', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    name: {
      type: STRING(128),
      allowNull: false,
    },
    path: {
      type: STRING(128),
      allowNull: false,
    },
    type: {
      type: STRING(128),
      allowNull: false,
    },
    size: {
      type: INTEGER,
    },
  });

  return File;
};
