
module.exports = (app) => {
  /**
   * 商品分类路由
   *
   * @class CommodityCategoryController
   * @extends {app.Controller}
   */
  class CommodityCategoryController extends app.Controller {
    /**
     * 参数规则-商品分类列表
     *
     * @readonly
     * @memberof CommodityCategoryController
     */
    get indexRule() {
      return {
        properties: {
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-创建商品分类
     *
     * @readonly
     * @memberof CommodityCategoryController
     */
    get createRule() {
      return {
        properties: {
          name: {
            type: 'string',
            maxLength: 10,
            minLength: 1,
          },
          cover_id: this.ctx.helper.rule.uuid,
          auto_charge: {
            type: 'boolean',
          },
        },
        required: ['name', 'cover_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     *  参数规则-修改商品分类
     *
     * @readonly
     * @memberof CommodityCategoryController
     */
    get updateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          name: {
            type: 'string',
            maxLength: 10,
            minLength: 1,
          },
          cover_id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-批量删除商品分类
     *
     * @readonly
     * @memberof CommodityCategoryController
     */
    get batchDestroyRule() {
      return {
        properties: {
          ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
        },
        required: ['ids'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取商品分类列表
     *
     * @memberof CommodityCategoryController
     * @returns {promise} 商品分类列表
     */
    async index() {
      const { ctx, service, indexRule } = this;

      const {
        sort, start, count,
      } = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);
      const commodityCategories = await service.commodityCategory.fetch(start, count, sort);

      ctx.jsonBody = {
        count: commodityCategories.count,
        start,
        items: commodityCategories.rows,
      };
    }

    /**
     * 创建商品分类
     *
     * @memberof CommodityCategoryController
     * @returns {promise} 创建的商品分类
     */
    async create() {
      const { ctx, service, createRule } = this;
      ctx.adminPermission();
      await ctx.validate(createRule);

      // 验证封面图是否存在并创建分类
      const { cover_id: coverId, name } = ctx.request.body;
      const file = await service.file.getByIdOrThrow(coverId);
      ctx.error(!!~file.type.indexOf('image/'), '封面非图片类型文件', 14002, 400); // eslint-disable-line
      await service.commodityCategory.isExisted(name);
      const commodityCategory = await app.model.CommodityCategory.create(ctx.request.body);

      ctx.jsonBody = commodityCategory;
    }

    /**
     * 修改商品分类
     *
     * @memberof CommodityCategoryController
     * @returns {promise} 修改的商品分类
     */
    async update() {
      const { ctx, service, updateRule } = this;
      ctx.adminPermission();
      await ctx.validate(updateRule);

      const { cover_id: coverId } = ctx.request.body;

      /* istanbul ignore else */
      if (coverId) {
        const file = await service.file.getByIdOrThrow(coverId);
        ctx.error(!!~file.type.indexOf('image/'), '封面非图片类型文件', 14002, 400); // eslint-disable-line      
      }
      const commodityCategory = await service.commodityCategory.getByIdOrThrow(ctx.params.id);
      Object.assign(commodityCategory, ctx.request.body);
      await commodityCategory.save();

      ctx.jsonBody = commodityCategory;
    }

    /**
     * 批量删除商品分类
     *
     * @memberof CommodityCategoryController
     * @returns {promise} 删除的商品分类
     */
    async batchDestroy() {
      const { ctx, service, batchDestroyRule } = this;
      ctx.adminPermission();
      await ctx.validate(batchDestroyRule, (reqData) => {
        ctx.assert(typeof reqData === 'object', '参数需为对象');

        // ids预处理为数组
        const data = Object.assign({}, reqData);
        const { ids } = data;
        data.ids = ids.split(',');
        return data;
      });

      // 查询并删除商品分类
      const ids = ctx.query.ids.split(',');
      const commodityCategories = await service.commodityCategory.getByIds(ids);
      ctx.error(commodityCategories.length !== 0, '商品分类不存在', 14000);

      // 验证分类是否存在关联商品
      await service.commodityCategory.isEmpty(ids);
      await service.commodityCategory.delete(ids);

      ctx.jsonBody = commodityCategories;
    }
  }
  return CommodityCategoryController;
};

