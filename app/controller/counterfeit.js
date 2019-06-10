'use strict';

module.exports = app => {
  /**
   * Counterfeit Controller
   *
   * @class CounterfeitController
   * @extends {app.Controller}
   */
  class CounterfeitController extends app.Controller {
    /**
     * 参数验证-报警列表
     *
     * @readonly
     * @memberof UserController
     */
    get indexRule() {
      return {
        properties: {
          barcode: {
            $ref: 'schema.definition#/oid',
          },
          tracing: {
            type: 'string',
          },
          state: {
            type: 'string',
            enum: ['UNHANDLED', 'RESOLVED'],
          },
          sender: {
            $ref: 'schema.definition#/oid',
          },
          factory: {
            $ref: 'schema.definition#/oid',
          },
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数验证-报警详情
     *
     * @readonly
     * @memberof UserController
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
     * 获取告警列表
     *
     * @memberof UserController
     * @return {promise} 告警列表
     */
    async index() {
      const { ctx, indexRule } = this;
      const { generateSortParam } = ctx.helper.pagination;
      // ctx.checkPermission('platform');

      const {
        limit = 10,
        offset = 0,
        sort = '-created_at',
        state,
      } = await ctx.verify(indexRule, ctx.request.query);

      const query = {};
      if (state) query.state = state;
      const counterfeits = await ctx.service.counterfeit.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'factory sender barcode tracing creator'
      );
      const count = await ctx.service.counterfeit.count(query);
      ctx.jsonBody = {
        data: counterfeits,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 参数验证-新增报警
     *
     * @readonly
     * @memberof UserController
     */
    get createRule() {
      return {
        properties: {
          key: {
            $ref: 'schema.definition#/oid',
          },
          barcode: {
            $ref: 'schema.definition#/oid',
          },
          images: {
            type: 'array',
            item: {
              $ref: 'schema.definition#/oid',
            },
          },
          description: {
            type: 'string',
          },
          phone: {
            $ref: 'schema.definition#/mobile',
          },
        },
        $async: true,
        required: ['key', 'barcode', 'images', 'description', 'phone'],
        additionalProperties: false,
      };
    }

    /**
     * 创建报警
     *
     * @memberof UserController
     * @return {promise} 新建的用户
     */
    async create() {
      const { ctx, createRule } = this;
      const { user_id } = ctx.registerPermission();
      const { key, barcode, images, description, phone } = await ctx.verify(
        createRule,
        Object.assign(ctx.request.body, ctx.query)
      );
      const isTracingExist = await ctx.service.tracing.findById(key);
      ctx.error(isTracingExist, 19001, '错误反馈对应的溯源码不存在');
      const { factory, records } = isTracingExist;
      const { sender } = records.pop();
      const isBarcodeExist = await ctx.service.barcode.findById(barcode);
      ctx.error(isBarcodeExist, 19002, '错误反馈对应的商品条形码不存在');
      const imagesCount = await ctx.service.file.count({
        _id: {
          $in: images,
        },
      });
      ctx.error(
        imagesCount === images.length,
        19002,
        '图片缺失或上传的ID信息有误'
      );

      const counterfeit = await ctx.service.counterfeit.create({
        creator: user_id,
        tracing: key,
        barcode,
        factory,
        sender,
        images,
        description,
        phone,
      });
      ctx.jsonBody = counterfeit;
    }

    /**
     * 获取告警详情
     *
     * @memberof UserController
     * @return {promise} 告警详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      ctx.checkPermission(['platform', id]);
      const counterfeit = await service.counterfeit.findById(id);
      ctx.jsonBody = counterfeit;
    }

    /**
     *  参数规则-修改报警
     *
     * @readonly
     * @memberof UserController
     */
    get updateRule() {
      return {
        properties: {
          id: {
            $ref: 'schema.definition#/oid',
          },
          result: {
            type: 'string',
          },
          state: {
            type: 'string',
            enum: ['UNHANDLED', 'RESOLVED'],
          },
        },
        $async: true,
        required: ['id'],
        additionalProperties: false,
      };
    }

    /**
     * 修改报警状态
     *
     * @memberof CommodityController
     * @return {promise} 被修改用户信息
     */
    async update() {
      const { ctx, updateRule } = this;
      const { id, result, state } = await ctx.verify(
        updateRule,
        Object.assign(ctx.params, ctx.request.body)
      );
      const { user_id } = ctx.checkPermission('platform');

      // 验证报警记录是否存在
      const isCounterfeitExist = await ctx.service.counterfeit.findById(id);
      ctx.error(isCounterfeitExist, 19002, '该条错误反馈不存在');
      // 验证当前状态能否进行结案操作
      ctx.error(
        isCounterfeitExist.state === 'UNHANDLED',
        19003,
        '已经结案的报警记录无法再次进行结案操作'
      );
      const modifiedData = {
        result,
        state,
        handler: user_id,
        handle_at: new Date(),
      };
      const { nModified } = await ctx.service.counterfeit.update(
        {
          _id: id,
        },
        modifiedData
      );
      ctx.error(nModified === 1, 19004, '结案操作失败');

      Object.assign(isCounterfeitExist, modifiedData);
      ctx.jsonBody = isCounterfeitExist;
    }
  }
  return CounterfeitController;
};
