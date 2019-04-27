'use strict';

const _ = require('lodash');

module.exports = app => {
  /**
   * 商品相关路由
   *
   * @class CommodityController
   * @extends {app.Controller}
   */
  class CommodityController extends app.Controller {
    /**
     * 参数规则-商品列表
     *
     * @readonly
     * @memberof CommodityController
     */
    get indexRule() {
      return {
        properties: {
          name: {
            $ref: 'schema.definition#/name',
          },
          category: {
            $ref: 'schema.definition#/oid',
          },
          enable: {
            type: 'boolean',
          },
          recommend: {
            type: 'boolean',
          },
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-商品详情
     *
     * @readonly
     * @memberof CommodityController
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
     * 参数规则-创建商品
     *
     * @readonly
     * @memberof CommodityController
     */
    get createRule() {
      return {
        properties: {
          name: {
            $ref: 'schema.definition#/name',
          },
          category: {
            $ref: 'schema.definition#/oid',
          },
          price: {
            type: 'number',
          },
          quata: {
            type: 'number',
          },
          act_price: {
            type: 'number',
          },
          description: {
            type: 'string',
            maxLength: 500,
            minLength: 1,
          },
          recommend: {
            type: 'boolean',
          },
          pictures: {
            type: 'array',
            items: {
              $ref: 'schema.definition#/oid',
            },
          },
          brands: {
            type: 'string',
          },
          isCustom: {
            type: 'boolean',
          },
        },
        required: ['name', 'category', 'description', 'price', 'pictures'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     *  参数规则-修改商品
     *
     * @readonly
     * @memberof CommodityController
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
          category: {
            $ref: 'schema.definition#/oid',
          },
          price: {
            type: 'number',
          },
          quata: {
            type: 'number',
          },
          act_price: {
            type: 'number',
          },
          description: {
            type: 'string',
            maxLength: 500,
            minLength: 1,
          },
          recommend: {
            type: 'boolean',
          },
          pictures: {
            type: 'array',
            items: {
              $ref: 'schema.definition#/oid',
            },
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-删除商品
     *
     * @readonly
     * @memberof CommodityController
     */
    get destroyRule() {
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
     * 获取商品列表
     *
     * @memberof CommodityController
     * @return {array} 商品列表
     */
    async index() {
      const { ctx, indexRule } = this;

      const { generateSortParam } = ctx.helper.pagination;
      const { limit = 10, offset = 0, sort = '-created_at' } = await ctx.verify(
        indexRule,
        ctx.request.query
      );

      const query = {};
      ['name', 'category', 'enable', 'recommend'].forEach(key => {
        const item = ctx.request.query[key];
        if (item) query[key] = item;
      });
      const commodities = await ctx.service.commodity.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'category pictures'
      );
      const count = await ctx.service.commodity.count(query);

      ctx.jsonBody = {
        data: commodities,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 获取商品详情
     *
     * @memberof CommodityController
     * @return {object} 商品详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);

      const commodity = await service.commodity.findById(
        id,
        'category pictures'
      );
      ctx.error(commodity, 15000, '商品不存在');
      ctx.jsonBody = commodity;
    }

    /**
     * 创建商品
     *
     * @memberof CommodityController
     * @return {object} 新建的商品
     */
    async create() {
      const { ctx, service, createRule } = this;
      const { pictures, category, name, act_price, price } = await ctx.verify(
        createRule,
        ctx.request.body
      );

      // 验证图片数量以及是否存在
      ctx.error(
        pictures.length <= 5 && pictures.length >= 1,
        15001,
        '商品图片数量需在1~5张范围内'
      );
      const files = await service.file.findMany({
        _id: {
          $in: pictures,
        },
      });
      ctx.error(
        files.length === pictures.length,
        15002,
        '商品图片重复/丢失或包含非图片类型文件'
      );
      const commodityCategory = await service.commodityCategory.findById(
        category
      );
      ctx.error(commodityCategory, 14000, '商品分类不存在');
      const commodity = await service.commodity.findOne({
        name,
        category,
      });
      ctx.error(!commodity, 15004, '商品名称已存在');
      if (!act_price) ctx.request.body.act_price = price;
      const createdCommodity = await service.commodity.create(ctx.request.body);
      ctx.jsonBody = createdCommodity;
    }

    /**
     * 修改商品
     *
     * @memberof CommodityController
     * @return {promise} 被修改商品
     */
    async update() {
      const { ctx, service, updateRule } = this;

      const { pictures, category, name, id } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );

      const commodity = await service.commodity.findById(id);
      ctx.error(commodity, 15000, '商品不存在');

      // 验证图片数量以及是否存在
      ctx.error(
        pictures.length <= 5 && pictures.length >= 1,
        15001,
        '商品图片数量需在1~5张范围内'
      );
      const files = await service.file.findMany({
        _id: {
          $in: pictures,
        },
      });
      ctx.error(
        files.length === pictures.length,
        15002,
        '商品图片重复/丢失或包含非图片类型文件'
      );
      const isCategoryExist = await service.commodityCategory.findById(
        category
      );
      ctx.error(isCategoryExist, 14000, '商品分类不存在');
      const isNameExist = await service.commodity.findOne({
        name,
        category,
      });
      ctx.error(!isNameExist, 15004, '商品名称已存在');

      // 商品更新
      Object.assign(commodity, ctx.request.body);
      const { nModified } = await ctx.service.commodity.update(
        {
          _id: id,
        },
        ctx.request.body
      );
      ctx.error(nModified === 1, 15005, '商品修改失败');

      ctx.jsonBody = commodity;
    }

    /**
     * 删除商品
     *
     * @memberof CommodityController
     * @return {array} 删除的商品
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      const { id } = await ctx.verify(destroyRule, ctx.params);

      // 查询并删除商品
      const commodity = await service.commodity.findById(id);
      ctx.error(commodity, '商品不存在', 15000);
      const { nModified } = await service.commodity.destroy({
        _id: id,
      });
      ctx.error(nModified === 1, 15006, '商品删除失败');
      ctx.jsonBody = commodity;
    }
  }

  return CommodityController;
};
