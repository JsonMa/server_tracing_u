module.exports = (app) => {
  /**
   * 商品分类相关service
   *
   * @class CommodityCategory
   * @extends {app.Service}
   */
  class CommodityCategory extends app.Service {
    /**
     * 判断商品分类是否存在
     *
     * @param {uuid} id -商品分类ID
     * @returns {promise} 返回商品分类的promise
     * @memberof CommodityCategory
     */
    getByIdOrThrow(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.ctx.model.CommodityCategory.findById(id).then((category) => {
        this.ctx.error(category, '商品分类不存在', 14000);
        return category;
      });
    }

    /**
     * 获取分类列表
     *
     * @param {int} start      -数据起始位置
     * @param {int} count      -数据条数
     * @param {string} sort    -是否排序
     * @memberof CommodityCategory
     * @returns {promise} 返回商品分类列表
     */
    fetch(start, count, sort) {
      const { assert } = this.ctx.helper;

      assert(typeof start === 'number', 'start需为数字');
      assert(typeof count === 'number', 'count需为数字');
      assert(typeof sort === 'string', 'sort需为字符串');

      /* istanbul ignore next */
      const order = sort === 'true' ? { } : { order: [['created_at', 'DESC']] };
      return this.app.model.CommodityCategory.findAndCountAll({
        offset: start,
        limit: count,
        ...order,
      });
    }

    /**
     * 获取商品分类详情
     *
     * @param {array} ids -商品分类ids
     * @memberof CommodityCategory
     * @returns {promise} 商品分类详情
     */
    getByIds(ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.CommodityCategory.findAll({
        where: {
          id: { $in: ids },
        },
      });
    }

    /**
     * 批量删除商品分类
     *
     * @param {array} ids -商品分类ids
     * @memberof CommodityCategory
     * @returns {promise} 被删除商品分类
     */
    delete(ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.CommodityCategory.destroy({
        where: {
          id: { $in: ids },
        },
      });
    }

    /**
     *  验证商品分类名是否存在
     *
     * @param {string} categoryName -商品名称
     * @memberof CommodityCategory
     * @returns {promise} 返回验证结果
     */
    isExisted(categoryName) {
      const { assert } = this.ctx.helper;
      assert(typeof categoryName === 'string', 'categoryName需为字符串');

      return this.app.model.CommodityCategory.find({
        where: {
          name: categoryName,
        },
      }).then((category) => {
        this.ctx.error(!category, '商品分类已存在', 14001);
      });
    }

    /**
     * 验证商品分类中是否包含商品
     *
     * @param {any} ids - 商品分类IDS
     * @memberof CommodityCategory
     * @returns {promise} 分类验证结果
     */
    isEmpty(ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.Commodity.count({
        where: {
          category_id: { $in: ids },
        },
      }).then((count) => {
        this.ctx.error(count === 0, '商品分类中存在关联商品', 14003);
      });
    }
  }
  return CommodityCategory;
};

