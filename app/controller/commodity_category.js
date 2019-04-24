'use strict';

module.exports = app => {
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
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-商品分类详情
     *
     * @readonly
     * @memberof CommodityCategoryController
     */
    get showRule() {
      return {
        properties: {
          id: {
            $ref: 'schema.definition#/oid',
          },
        },
        required: ['id'],
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
            $ref: 'schema.definition#/name',
          },
          cover: {
            $ref: 'schema.definition#/oid',
          },
          description: {
            type: 'string',
          },
        },
        required: ['name', 'cover'],
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
          id: {
            $ref: 'schema.definition#/oid',
          },
          name: {
            $ref: 'schema.definition#/name',
          },
          cover: {
            $ref: 'schema.definition#/oid',
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取商品分类列表
     *
     * @memberof CommodityCategoryController
     * @return {promise} 商品分类列表
     */
    async index() {
      const {
        ctx,
        service,
        indexRule,
      } = this;
      const {
        generateSortParam,
      } = ctx.helper.pagination;
      const {
        limit = 10,
        offset = 0,
        sort = '-created_time',
      } = await ctx.verify(indexRule, ctx.request.query);
      const commodityCategories = await service.commodityCategory.findMany(null, null, {
        limit: parseInt(limit),
        skip: parseInt(offset),
        sort: generateSortParam(sort),
      });
      const count = await service.commodityCategory.count();

      ctx.jsonBody = {
        data: commodityCategories,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 获取详情
     *
     * @memberof CommodityCategoryController
     * @return {promise} 商品分类详情
     */
    async show() {
      const {
        ctx,
        service,
        showRule,
      } = this;
      const {
        id,
      } = await ctx.verify(showRule, ctx.params);
      const commodityCategory = await service.commodityCategory.findById(id);
      ctx.error(commodityCategory, 14000, '商品分类不存在');
      ctx.jsonBody = commodityCategory;
    }


    /**
     * 创建商品分类
     *
     * @memberof CommodityCategoryController
     * @return {promise} 创建的商品分类
     */
    async create() {
      const {
        ctx,
        service,
        createRule,
      } = this;
      await ctx.verify(createRule, ctx.request.body);

      const {
        cover,
        name,
      } = ctx.request.body;
      const file = await service.file.findById(cover);
      ctx.error(file, 16000, '封面文件不存在');
      ctx.error(file.type.includes('image/'), 14002, '封面非图片类型文件');
      const category = await service.commodityCategory.findOne({
        name,
      });
      ctx.error(!category, 14001, '该分类名已存在');
      const commodityCategory = await service.commodityCategory.create(ctx.request.body);

      ctx.jsonBody = commodityCategory;
    }

    /**
     * 修改商品分类
     *
     * @memberof CommodityCategoryController
     * @return {promise} 修改的商品分类
     */
    async update() {
      const {
        ctx,
        service,
        updateRule,
      } = this;
      const {
        cover,
        name,
        id,
      } = await ctx.verify(updateRule, Object.assign(ctx.request.body, ctx.params));

      if (cover) {
        const file = await service.file.findById(cover);
        ctx.error(file, 16000, '封面文件不存在');
        ctx.error(file.type.includes('image/'), 14002, '封面非图片类型文件');
      }
      if (name) {
        const category = await service.commodityCategory.findOne({
          name,
        });
        ctx.error(!category, 14001, '商品分类名已存在');
      }
      const commodityCategory = await service.commodityCategory.findById(id);
      ctx.error(commodityCategory, 14000, '商品分类不存在');
      Object.assign(commodityCategory, ctx.request.body);
      const {
        nModified,
      } = await service.commodityCategory.update({
        _id: id,
      },
      ctx.request.body
      );
      ctx.error(nModified === 1, 14004, '商品分类修改失败');
      ctx.jsonBody = commodityCategory;
    }

    /**
     * 批量删除商品分类
     *
     * @memberof CommodityCategoryController
     * @return {promise} 删除的商品分类
     */
    async destory() {
      const {
        ctx,
        service,
        showRule,
      } = this;
      const {
        id,
      } = await ctx.verify(showRule, ctx.params);

      // 查询商品分类
      const category = await service.commodityCategory.findById(id);
      ctx.error(category, 14000, '商品分类不存在');

      const {
        nModified,
      } = await service.commodityCategory.destroy({
        _id: id,
      });
      ctx.error(nModified === 1, 14005, '商品分类删除失败');
      ctx.jsonBody = category;
    }
  }
  return CommodityCategoryController;
};
