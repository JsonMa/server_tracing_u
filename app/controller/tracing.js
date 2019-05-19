'use strict';
const uuid = require('uuid/v4');

module.exports = app => {
  /**
   * 溯源码相关路由
   *
   * @class CommodityController
   * @extends {app.Controller}
   */
  class TracingController extends app.Controller {
    /**
     * 参数规则-溯源列表
     *
     * @readonly
     * @memberof CommodityController
     */
    get indexRule() {
      return {
        properties: {
          order: {
            $ref: 'schema.definition#/oid',
          },
          factory: {
            $ref: 'schema.definition#/oid',
          },
          owner: {
            $ref: 'schema.definition#/oid',
          },
          enable: {
            type: 'boolean',
          },
          isConsumerReceived: {
            type: 'boolean',
          },
          isFactoryTracing: {
            type: 'boolean',
          },
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-溯源详情
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
          public_key: {
            type: 'string',
          },
          private_key: {
            type: 'string',
          },
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-创建溯源码
     *
     * @readonly
     * @memberof CommodityController
     */
    get createRule() {
      return {
        properties: {
          order: {
            $ref: 'schema.definition#/oid',
          },
        },
        required: ['order'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     *  参数规则-修改溯源码
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
     * 参数规则-删除溯源码
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
     * 获取溯源码列表
     *
     * @memberof CommodityController
     * @return {array} 溯源码列表
     */
    async index() {
      const { ctx, indexRule } = this;

      const { generateSortParam } = ctx.helper.pagination;
      const { limit = 10, offset = 0, sort = '-created_at' } = await ctx.verify(
        indexRule,
        ctx.request.query
      );

      const query = {};
      [
        'order',
        'owner',
        'factory',
        'enable',
        'isConsumerReceived',
        'isFactoryTracing',
      ].forEach(key => {
        const item = ctx.request.query[key];
        if (item) query[key] = item;
      });
      const tracings = await ctx.service.tracing.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'category pictures'
      );
      const count = await ctx.service.tracing.count(query);

      ctx.jsonBody = {
        data: tracings,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 获取溯源码详情
     *
     * @memberof CommodityController
     * @return {object} 溯源码详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { id, public_key, private_key } = await ctx.verify(
        showRule,
        ctx.params
      );

      const tracing = await service.tracing.findById(
        id || public_key || private_key,
        'owner order'
      );
      ctx.error(tracing, 18002, '获取溯源码信息失败，该溯源码不存在');
      ctx.jsonBody = tracing;
    }

    /**
     * 创建溯源码
     *
     * @memberof CommodityController
     * @return {object} 指定订单生成的溯源码
     */
    async create() {
      const { ctx, service, createRule } = this;
      const { order } = await ctx.verify(createRule, ctx.request.body);

      // 验证订单是否存在
      const isOrderExist = await service.tracing.findById(order, 'commidity');
      ctx.error(isOrderExist, 18000, '生成溯源码失败，订单不存在');
      const { commodity, isStagePay, status, count, buyer } = isOrderExist;
      // 验证订单状态，非定制溯源码，验证是否付全款，定制溯源码验证是否已经付首付款
      if (isStagePay) {
        ctx.error(
          status === 'FIRST_PAYED',
          18001,
          '订单未支付，无法生成溯源码'
        );
      } else {
        ctx.error(status === 'ALL_PAYED', 18001, '订单未支付，无法生成溯源码');
      }

      const targetTracings = [];
      for (let i = 0; i < commodity.quata * count; i++) {
        targetTracings.push({
          factory: buyer,
          owner: buyer,
          order,
          private_key: uuid(),
          public_key: uuid(),
        });
      }
      const tracings = await service.tracing.insertMany(targetTracings);
      ctx.jsonBody = tracings;
    }

    /**
     * 修改溯源码
     *
     * @memberof CommodityController
     * @return {promise} 被修改溯源码
     */
    async update() {
      const { ctx, service, updateRule } = this;

      const { pictures, category, name, id } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );

      const commodity = await service.commodity.findById(id);
      ctx.error(commodity, 15000, '溯源码不存在');

      // 验证图片数量以及是否存在
      ctx.error(
        pictures.length <= 5 && pictures.length >= 1,
        15001,
        '溯源码图片数量需在1~5张范围内'
      );
      const files = await service.file.findMany({
        _id: {
          $in: pictures,
        },
      });
      ctx.error(
        files.length === pictures.length,
        15002,
        '溯源码图片重复/丢失或包含非图片类型文件'
      );
      const isCategoryExist = await service.commodityCategory.findById(
        category
      );
      ctx.error(isCategoryExist, 14000, '溯源码分类不存在');
      const isNameExist = await service.commodity.findOne({
        name,
        category,
      });
      ctx.error(!isNameExist, 15004, '溯源码名称已存在');

      // 溯源码更新
      Object.assign(commodity, ctx.request.body);
      const { nModified } = await ctx.service.commodity.update(
        {
          _id: id,
        },
        ctx.request.body
      );
      ctx.error(nModified === 1, 15005, '溯源码修改失败');

      ctx.jsonBody = commodity;
    }

    /**
     * 删除溯源码
     *
     * @memberof CommodityController
     * @return {array} 删除的溯源码
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      const { id } = await ctx.verify(destroyRule, ctx.params);

      // 查询并删除溯源码
      const tracing = await service.tracing.findById(id);
      ctx.error(tracing, '溯源码不存在', 18002);
      const { nModified } = await service.tracing.destroy({
        _id: id,
      });
      ctx.error(nModified === 1, 18003, '溯源码删除失败');
      ctx.jsonBody = tracing;
    }
  }

  return TracingController;
};
