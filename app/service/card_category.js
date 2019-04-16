module.exports = (app) => {
  /**
     * 贺卡分类相关service
     *
     * @class CardCategory
     * @extends {app.Service}
     */
  class CardCategory extends app.Service {
    /**
     * 判断贺卡分类是否存在
     *
     * @param {uuid} id    -贺卡分类ID
     * @returns {promise} 返回贺卡分类的promise
     * @memberof CardCategory
     */
    getByIdOrThrow(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.ctx.model.CardCategory.findById(id).then((category) => {
        this.ctx.error(category, '贺卡分类不存在', 14000);
        return category;
      });
    }

    /**
     * 获取分类列表
     *
     * @param {int} start      -数据起始位置
     * @param {int} count      -数据条数
     * @param {string} sort    -是否排序
     * @memberof CardCategory
     * @returns {promise} 返回贺卡分类列表
     */
    fetch(start, count, sort) {
      const { assert } = this.ctx.helper;

      assert(typeof start === 'number', 'start需为数字');
      assert(typeof count === 'number', 'count需为数字');
      assert(typeof sort === 'string', 'sort需为字符串');

      /* istanbul ignore next */
      const order = sort === 'true' ? { } : { order: [['created_at', 'DESC']] };
      return this.app.model.CardCategory.findAndCountAll({
        offset: start,
        limit: count,
        ...order,
      });
    }

    /**
     * 获取贺卡分类详情
     *
     * @param {array} ids -贺卡分类ids
     * @memberof CardCategory
     * @returns {promise} 贺卡分类详情
     */
    getByIds(ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.CardCategory.findAll({
        where: {
          id: { $in: ids },
        },
      });
    }

    /**
     * 删除贺卡分类
     *
     * @param {array} id -贺卡分类id
     * @memberof CardCategory
     * @returns {promise} 被删除贺卡分类
     */
    delete(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.app.model.CardCategory.destroy({
        where: {
          id,
        },
      });
    }

    /**
     *  验证贺卡分类名是否存在
     *
     * @param {string} name -贺卡名称
     * @memberof CardCategory
     * @returns {promise} 返回验证结果
     */
    isExisted(name) {
      const { assert } = this.ctx.helper;
      assert(typeof name === 'string', 'categoryName需为字符串');

      return this.app.model.CardCategory.find({
        where: {
          name,
        },
      }).then((category) => {
        this.ctx.error(!category, '贺卡分类已存在', 19003);
      });
    }

    /**
     * 验证贺卡分类中是否包含贺卡
     *
     * @param {any} id - 贺卡分类id
     * @memberof CardCategory
     * @returns {promise} 分类验证结果
     */
    isEmpty(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.app.model.Card.count({
        where: {
          category_id: id,
        },
      }).then((count) => {
        this.ctx.error(count === 0, '贺卡分类中存在关联贺卡', 19004);
      });
    }
  }
  return CardCategory;
};
