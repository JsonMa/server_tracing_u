const fs = require('fs');

module.exports = (app) => {
  /**
   * 文件相关service
   *
   * @class File
   * @extends {app.Service}
  */
  class File extends app.Service {
    /**
     * 验证文件是否存在
     *
     * @memberof FileService
     * @param {uuid} id - 文件id
     * @returns {Promise} 文件model实例
    */
    getByIdOrThrow(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.ctx.model.File.findById(id).then((file) => {
        this.ctx.error(file, '依赖文件不存在', 16000);
        return file;
      });
    }

    /**
     * 统计文件数量
     *
     * @param {array} ids   -文件的ids
     * @param {string} type -文件类型
     * @returns {promise} 返回匹配的所有文件
     * @memberof File
     */
    count(ids, type) {
      const { assert, uuidValidate } = this.ctx.helper;
      const { Op } = this.app.Sequelize;
      let fileType = {};

      // ids验证
      assert(Array.isArray(ids), 'ids需为数组');
      if (type) {
        assert(typeof type === 'string', 'type需为字符串');
        fileType = { type: { [Op.like]: `%${type}%` } };
      }
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.ctx.model.File.findAndCountAll({
        where: {
          id: { $in: ids },
          ...fileType,
        },
      });
    }

    /**
     * 删除文件
     *
     * @returns {promise} 被删除的文件
     * @param {any} id -文件id
     * @memberof File
     */
    async delete(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      const file = await this.ctx.model.File.findById(id);
      if (file) fs.unlinkSync(file.path); // 同步删除文件
      await file.destroy({ force: true }); // 删除数据库记录
      return file;
    }
  }

  return File;
};
