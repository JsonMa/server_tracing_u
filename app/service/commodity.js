module.exports = (app) => {
  /**
   * 商品相关service
   *
   * @class Commodity
   * @extends {app.Service}
   */
  class Commodity extends app.Service {
    /**
     * 获取商品列表
     *
     * @param {string}  pdName        -商品名称
     * @param {uuid}    categoryId    -商品分类ID
     * @param {string}  pdStatus      -商品状态
     * @param {string}  pdRecommended -商品推荐
     * @param {string}  pgStart       -从第几条数据开始
     * @param {string}  pgCount       -数据条数
     * @param {string}  pgSort        -是否排序
     * @memberof Commodity
     * @returns {promise} 返回商品列表
     */
    fetch(pdName, categoryId, pdStatus, pdRecommended, pgStart, pgCount, pgSort) {
      const { assert, uuidValidate } = this.ctx.helper;

      /* istanbul ignore else */
      if (pdName) assert(typeof pdName === 'string', 'pdName需为字符串');
      /* istanbul ignore else */
      if (categoryId) assert(uuidValidate(categoryId), 'categoryId需为uuid格式');
      /* istanbul ignore else */
      if (pdStatus) assert(typeof pdStatus === 'string', 'pdStatus需为字符串');
      /* istanbul ignore next */
      if (pdRecommended) assert(pdRecommended === 'true' || pdRecommended === 'false', 'recommended需为true或false');

      assert(typeof pgStart === 'number', 'pgStart需为字符串');
      assert(typeof pgCount === 'number', 'pgCount需为字符串');
      assert(typeof pgSort === 'string', 'pgSort需为字符串');

      const { Op } = this.app.Sequelize;

      /* istanbul ignore next */
      const timeOrder = pgSort === 'true' ? ['updated_at', 'DESC'] : ['updated_at', 'ASC'];
      /* istanbul ignore next */
      const status = pdStatus === undefined ? { } : { status: pdStatus };
      /* istanbul ignore next */
      const category = categoryId === undefined ? { } : { category_id: categoryId };
      /* istanbul ignore next */
      const recommended = pdRecommended === undefined ? { } : { recommended: pdRecommended === 'true' };
      /* istanbul ignore next */
      const name = pdName === undefined ? { } : {
        name: {
          [Op.like]: `%${pdName}%`,
        },
      };

      return this.app.model.Commodity.findAndCountAll({
        where: {
          ...name,
          ...category,
          ...status,
          ...recommended,
        },
        offset: pgStart,
        limit: pgCount,
        order: [
          ['status', 'ASC'],
          ['recommended', 'DESC'],
          timeOrder,
        ],
      });
    }

    /**
     * 创建商品
     *
     * @param {string}   pdName          - 商品名称
     * @param {string}   des             - 商品描述
     * @param {number}   pdPrice         - 商品价格
     * @param {number}   actPrice        - 商品活动价格
     * @param {boolean}  pdRecommended   - 是否推荐
     * @param {string}   categoryId      - 所属类别ID
     * @param {array}    pictureIds      - 图片
     * @param {number}   quata           - 二维码额度
     * @memberof Commodity
     * @returns {promise} 返回创建的商品
     */
    create(pdName, des, pdPrice, actPrice, pdRecommended, categoryId, pictureIds, quata) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(typeof pdName === 'string', 'pdName需为字符串');
      assert(typeof des === 'string', 'des需为字符串');
      assert(typeof pdPrice === 'number', 'pdPrice需为数字');
      if (quata) assert(typeof quata === 'number', 'quata需为数字');
      if (actPrice) assert(typeof actPrice === 'number', 'actPrice需为数字');
      assert(uuidValidate(categoryId), 'categoryId需为uuid格式');
      /* istanbul ignore next */
      if (pdRecommended) assert(typeof pdRecommended === 'boolean', 'pdRecommended需为布尔值');
      /* istanbul ignore next */
      if (pictureIds) {
        assert(Array.isArray(pictureIds), 'pictureIds需为数组');
        pictureIds.forEach((id) => {
          assert(uuidValidate(id), 'pictureId需为uuid格式');
        });
      }

      const commodity = {
        name: pdName,
        description: des,
        price: pdPrice,
        act_price: actPrice,
        recommended: pdRecommended,
        category_id: categoryId,
        picture_ids: pictureIds,
        quata,
      };

      return this.app.model.Commodity.create(commodity);
    }

    /**
     * 删除指定商品
     *
     * @param {array} ids -被删除的商品ID
     * @memberof Commodity
     * @returns {promise} 返回删除商品
     */
    delete(ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.Commodity.destroy({
        where: {
          id: { $in: ids },
        },
      });
    }

    /**
     * 批量更新商品
     *
     * @param {object} values -待更新的参数
     * @param {array} ids -待更新的商品
     * @memberof Commodity
     * @returns {promise} 返回批量更新商品
     */
    update(values, ids) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(typeof values === 'object', 'values需为对象');
      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.ctx.model.Commodity.update(
        values,
        {
          where: {
            id: { $in: ids },
          },
          fields: ['status', 'recommended'],
        },
      );
    }

    /**
     * 获取商品详情
     *
     * @param {string} id -商品ID
     * @memberof Commodity
     * @returns {promise} 返回商品详情
     */
    getByIdOrThrow(id) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(id), 'id需为uuid格式');

      return this.app.model.Commodity.findById(id).then((commodity) => {
        this.ctx.error(commodity, '商品不存在', 15000);
        return commodity;
      });
    }

    /**
     * 获取商品详情
     *
     * @param {array} ids -商品ids
     * @memberof Commodity
     * @returns {promise} 返回查询结果
     */
    getByIds(ids) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.Commodity.findAll({
        where: {
          id: { $in: ids },
        },
      });
    }

    /**
     * 统计存在的商品数量
     *
     * @param {array} ids -商品ids
     * @memberof Commodity
     * @returns {promise} 返回统计结果
     */
    count(ids) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(Array.isArray(ids), 'ids需为数组');
      ids.forEach((id) => {
        assert(uuidValidate(id), 'id需为uuid格式');
      });

      return this.app.model.Commodity.count({
        where: {
          id: { $in: ids },
        },
      });
    }
  }

  return Commodity;
};

