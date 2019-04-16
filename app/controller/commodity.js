const _ = require('lodash');

module.exports = (app) => {
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
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          category_id: this.ctx.helper.rule.uuid,
          status: {
            type: 'string',
            enum: [
              'ON',
              'OFF',
            ],
          },
          recommended: {
            type: 'string',
            enum: [
              'true',
              'false',
            ],
          },
          embed: {
            type: 'string',
            enum: ['category'],
          },
          ...this.ctx.helper.rule.pagination,
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
          id: this.ctx.helper.rule.uuid,
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
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          category_id: this.ctx.helper.rule.uuid,
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
          recommended: {
            type: 'boolean',
          },
          attr: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                attr_name: {
                  type: 'string',
                  maxLength: 20,
                  minLength: 1,
                },
                attr_value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    maxLength: 20,
                    minLength: 1,
                  },
                },
              },
            },
          },
          picture_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
        },
        required: ['name', 'category_id', 'description', 'price', 'picture_ids'],
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
          id: this.ctx.helper.rule.uuid,
          name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          category_id: this.ctx.helper.rule.uuid,
          price: {
            type: 'number',
          },
          quata: {
            type: 'number',
          },
          act_price: {
            oneOf: [
              { type: 'null' },
              { type: 'number' },
            ],
          },
          description: {
            type: 'string',
            maxLength: 500,
            minLength: 1,
          },
          recommended: {
            type: 'boolean',
          },
          picture_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-批量修改商品
     *
     * @readonly
     * @memberof CommodityController
     */
    get batchUpdateRule() {
      return {
        properties: {
          ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
          status: {
            type: 'string',
            enum: [
              'ON',
              'OFF',
            ],
          },
          recommended: {
            type: 'boolean',
          },
        },
        required: ['ids'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-批量删除商品
     *
     * @readonly
     * @memberof CommodityController
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
     * 参数规则-添加属性
     *
     * @readonly
     * @memberof CommodityController
     */
    get attributeCreateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          attr_name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          attr_value: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 20,
              minLength: 1,
            },
          },
        },
        required: ['id', 'attr_name', 'attr_value'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-获取商品属性列表
     *
     * @readonly
     * @memberof CommodityController
     */
    get attributeIndexRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-获取商品指定属性
     *
     * @readonly
     * @memberof CommodityController
     */
    get attributeShowRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          attr_id: this.ctx.helper.rule.uuid,
        },
        required: ['id', 'attr_id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-修改商品指定属性
     *
     * @readonly
     * @memberof CommodityController
     */
    get attributeUpdateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          attr_id: this.ctx.helper.rule.uuid,
          attr_name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          attr_value: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 20,
              minLength: 1,
            },
          },
        },
        required: ['id', 'attr_id', 'attr_name', 'attr_value'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取商品列表
     *
     * @memberof CommodityController
     * @returns {array} 商品列表
     */
    async index() {
      const { ctx, indexRule } = this;
      const { commodity } = ctx.service;
      const {
        name, sort, start, count, category_id: categoryId, status, recommended, embed,
      } = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);

      // 获取商品及商品分类
      const commodities = await commodity.fetch(name, categoryId, status, recommended, start, count, sort); // eslint-disable-line
      let categories;
      /* istanbul ignore next */
      if (embed === 'category' && !!commodities) {
        const uniqIds = _.union(commodities.rows.map(row => row.category_id));
        categories = await app.model.CommodityCategory.findAll({ where: { id: { $in: uniqIds } } });
      }
      /* istanbul ignore next */
      categories = embed !== 'category' ? { } : { categories };

      ctx.jsonBody = Object.assign({
        start,
        count: commodities.count,
        items: commodities.rows,
        ...categories,
      });
    }

    /**
     * 获取商品详情
     *
     * @memberof CommodityController
     * @returns {object} 商品详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);

      const { id } = ctx.params;
      const commodity = await service.commodity.getByIdOrThrow(id);

      ctx.jsonBody = commodity;
    }

    /**
     * 创建商品
     *
     * @memberof CommodityController
     * @returns {object} 新建的商品
     */
    async create() {
      const { ctx, service, createRule } = this;
      ctx.adminPermission();
      await ctx.validate(createRule);

      const {
        picture_ids: pictureIds,
        category_id: categoryId,
        name,
        description,
        recommended,
        attr,
        quata,
      } = ctx.request.body;

      let {
        price,
        act_price: actPrice,
      } = ctx.request.body;

      // 验证图片数量以及是否存在
      ctx.error(pictureIds.length <= 5 && pictureIds.length >= 1, '商品图片数量需在1~5张范围内', 15001);
      const files = await service.file.count(pictureIds, 'image');
      ctx.error(files.count === pictureIds.length, '商品图片重复/丢失或包含非图片类型文件', 15002);


      // 价格处理
      price = _.floor(price, 2);
      /* istanbul ignore next */
      actPrice = !!actPrice ? _.floor(actPrice, 2) : undefined; // eslint-disable-line

      // 验证分类是否存在
      await service.commodityCategory.getByIdOrThrow(categoryId);

      // 创建商品
      const commodity = await service.commodity.create(
        name,
        description,
        price,
        actPrice,
        recommended,
        categoryId,
        pictureIds,
        quata,
      );

      // 为指定商品添加属性
      /* istanbul ignore else */
      if (attr && commodity) {
        const records = attr.map((attribute) => {
          const { attr_name: attrName, attr_value: attrValues } = attribute;
          return {
            name: attrName,
            values: attrValues,
            commodity_id: commodity.id,
          };
        });
        await app.model.CommodityAttr.bulkCreate(records);
      }

      ctx.jsonBody = commodity;
    }

    /**
     * 修改商品
     *
     * @memberof CommodityController
     * @returns {promise} 被修改商品
     */
    async update() {
      const { ctx, service, updateRule } = this;
      ctx.adminPermission();
      await ctx.validate(updateRule);

      const {
        picture_ids: pictureIds,
        category_id: categoryId,
        price,
        quata,
        act_price: actPrice,
      } = ctx.request.body;
      const commodity = await service.commodity.getByIdOrThrow(ctx.params.id);

      // 验证分类是否存在
      /* istanbul ignore else */
      if (categoryId) await service.commodityCategory.getByIdOrThrow(categoryId);

      // 验证图片是否存在
      /* istanbul ignore else */
      if (pictureIds) {
        ctx.error(pictureIds.length <= 5 && pictureIds.length >= 1, '商品图片数量需在1~5张范围内', 15001);
        const files = await service.file.count(pictureIds, 'image');
        ctx.error(files.count === pictureIds.length, '商品图片重复/丢失或包含非图片类型文件', 15002);
      }

      // 价格处理
      /* istanbul ignore next */
      if (price) ctx.request.body.price = _.floor(price, 2);
      /* istanbul ignore next */
      if (actPrice) ctx.request.body.act_price = _.floor(actPrice, 2); // eslint-disable-line
      /* istanbul ignore next */
      if (quata) ctx.request.body.quata = parseInt(quata, 10);

      // 商品更新
      Object.assign(commodity, ctx.request.body);
      await commodity.save();

      ctx.jsonBody = commodity;
    }

    /**
     * 批量修改商品
     *
     * @memberof CommodityController
     * @returns {array} 被修改商品列表
     */
    async batchUpdate() {
      const { ctx, service, batchUpdateRule } = this;
      ctx.adminPermission();

      // query参数验证
      const { ids: queryIds } = ctx.query;
      ctx.assert(queryIds && typeof queryIds === 'string', 'query中缺少必要的ids参数', 400);
      await ctx.validate(batchUpdateRule, (reqData) => {
        ctx.assert(typeof reqData === 'object', '参数需为对象');

        // ids预处理为数组
        const data = Object.assign({}, reqData);
        const { ids } = data;
        /* istanbul ignore next */
        data.ids = ids && typeof ids === 'string' ? ids.split(',') : ids;
        return data;
      });

      const ids = queryIds.split(',');
      const values = Object.assign({}, ctx.request.body);

      // 批量修改并返回修改后的商品列表
      const products = await service.commodity.count(ids);
      ctx.error(products === ids.length, '参数中包含不存在的商品', 15003);
      await service.commodity.update(values, ids);
      const commodities = await service.commodity.getByIds(ids);

      ctx.jsonBody = commodities;
    }

    /**
     * 批量删除商品
     *
     * @memberof CommodityController
     * @returns {array} 删除的商品列表
     */
    async batchDestroy() {
      const { ctx, service, batchDestroyRule } = this;
      ctx.adminPermission();

      // query参数验证
      const { ids: queryIds } = ctx.query;
      ctx.assert(queryIds && typeof queryIds === 'string', 'query中缺少必要的ids参数', 400);
      await ctx.validate(batchDestroyRule, (reqData) => {
        ctx.assert(typeof reqData === 'object', '参数需为对象');

        // ids预处理为数组
        const data = Object.assign({}, reqData);
        const { ids } = data;
        /* istanbul ignore next */
        data.ids = ids && typeof ids === 'string' ? ids.split(',') : ids;
      });

      // 查询并删除商品
      const ids = ctx.query.ids.split(',');
      const commodities = await service.commodity.getByIds(ids);
      ctx.error(commodities.length !== 0, '商品不存在', 15000);
      await service.commodity.delete(ids);

      ctx.jsonBody = commodities;
    }

    /**
     * 创建属性
     *
     * @memberof CommodityController
     * @returns {object} 创建的属性
     */
    async createAttribute() {
      const { ctx, service, attributeCreateRule } = this;
      ctx.adminPermission();
      await ctx.validate(attributeCreateRule);

      // 获取参数并创建属性
      const { attr_name: attrName, attr_value: attrValue } = ctx.request.body;
      await service.commodityAttr.isExisted(attrName, ctx.params.id);
      const attribute = await service.commodityAttr.create(ctx.params.id, attrName, attrValue);

      ctx.jsonBody = attribute;
    }

    /**
     * 返回指定商品的属性列表
     *
     * @memberof CommodityController
     * @returns {array} 返回属性列表
     */
    async attributeIndex() {
      const { ctx, service, attributeIndexRule } = this;
      await ctx.validate(attributeIndexRule);

      // 验证是否存在
      await service.commodity.getByIdOrThrow(ctx.params.id);

      // 获取属性列表
      const attributes = await service.commodityAttr.fetch(ctx.params.id);

      ctx.jsonBody = attributes;
    }

    /**
     * 返回商品的指定属性
     *
     * @memberof CommodityController
     * @returns {array} 返回指定属性
     */
    async attributeShow() {
      const { ctx, service, attributeShowRule } = this;
      await ctx.validate(attributeShowRule);

      // 获取参数及查询指定商品属性
      const { attr_id: attrId, id } = ctx.params;
      const attribute = await service.commodityAttr.getByIdOrThrow(attrId, id);

      ctx.jsonBody = attribute;
    }

    /**
     * 修改商品指定属性
     *
     * @memberof CommodityController
     * @returns {object} 返回修改后的属性
     */
    async attributeUpdate() {
      const { ctx, service, attributeUpdateRule } = this;
      ctx.adminPermission();
      await ctx.validate(attributeUpdateRule);

      // 获取参数并修改指定属性
      const { attr_id: attrId, id } = ctx.params;
      const attribute = await service.commodityAttr.getByIdOrThrow(attrId, id);
      Object.assign(attribute, {
        name: ctx.request.body.attr_name,
        values: ctx.request.body.attr_value,
      });
      await attribute.save();

      ctx.jsonBody = attribute;
    }

    /**
     * 删除商品指定属性
     *
     * @memberof CommodityController
     * @returns {object} 返回被删除的属性值
     */
    async destoryAttribute() {
      const { ctx, service, attributeShowRule } = this;
      ctx.adminPermission();
      await ctx.validate(attributeShowRule);

      const { attr_id: attrId, id } = ctx.params;
      const attribute = await service.commodityAttr.getByIdOrThrow(attrId, id);
      await attribute.destroy({ force: true });

      ctx.jsonBody = attribute;
    }
  }

  return CommodityController;
};

