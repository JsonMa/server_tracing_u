'use strict';

module.exports = app => {
  /**
   * Barcode Controller
   *
   * @class barcodeController
   * @extends {app.Controller}
   */
  class barcodeController extends app.Controller {
    /**
     * add barcode rule
     *
     * @readonly
     * @memberof barcodeController
     */
    get createRule() {
      return {
        properties: {
          barcode: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          manufacturer: {
            type: 'string',
          },
          attributes: {
            type: 'array',
            item: {
              properties: {
                name: {
                  type: 'string',
                },
                value: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
        },
        required: ['barcode', 'name', 'description', 'manufacturer'],
        $async: true,
        additionalProperties: false,
      };
    }
    /**
     * show barcode rule
     *
     * @readonly
     * @memberof barcodeController
     */
    get showRule() {
      return {
        properties: {
          barcode: {
            type: 'string',
          },
        },
        required: ['barcode'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * delete barcode rule
     *
     * @readonly
     * @memberof barcodeController
     */
    get destroyRule() {
      return {
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * create barcode
     *
     * @memberof barcodeController
     * @return {promise} created barcode info
     */
    async create() {
      const { ctx, createRule } = this;
      const { user_id } = ctx.registerPermission(); // 是否为已注册且登录的用户
      const { barcode } = await ctx.verify(createRule, ctx.request.body);
      const isExist = await ctx.service.barcode.findOne({
        barcode,
      });
      ctx.error(!isExist, 13000, ' 新增条形码失败，该条形码已存在');
      const createdBar = await ctx.service.barcode.create(
        Object.assign(ctx.request.body, { creator: user_id })
      );
      ctx.jsonBody = createdBar;
    }

    /**
     * get barcode
     *
     * @memberof barcodeController
     * @return {promise} code detail
     */
    async show() {
      const { ctx, service, showRule } = this;
      ctx.registerPermission();
      const { barcode } = await ctx.verify(showRule, ctx.params);
      const isExit = await service.barcode.findOne({
        barcode,
      });
      ctx.assert(isExit, 13001, '该条形码不存在');
      ctx.jsonBody = isExit;
    }

    /**
     *
     *
     * @readonly
     * @memberof barcodeController
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
     * list barcodes
     *
     * @memberof barcodeController
     * @return {undefined}
     */
    async index() {
      const { ctx, indexRule } = this;
      const { user_id } = ctx.registerPermission();
      const { generateSortParam } = ctx.helper.pagination;
      const { limit = 10, offset = 0, sort = '-created_at' } = await ctx.verify(
        indexRule,
        ctx.request.query
      );

      const query = { creator: user_id };
      const barcodes = await ctx.service.barcode.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'category pictures'
      );
      const count = await ctx.service.barcode.count(query);

      ctx.jsonBody = {
        data: barcodes,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * update barcode
     *
     * @memberof barcodeController
     * @return {promise} updated barcode
     */
    async update() {
      const { ctx, service, createRule } = this;
      ctx.registerPermission(); // 是否已经登录
      const { barcode } = await ctx.verify(createRule, ctx.request.body);
      const isExit = service.barcode.findOne({
        barcode,
      });
      ctx.assert(isExit, 13001, '该条形码不存在');
      ctx.oneselfPermission(isExit.creator); // 被修改的条形码是否是自己创建的

      const { nModified } = await ctx.service.barcode.update(
        {
          barcode,
        },
        ctx.request.body
      );
      ctx.error(nModified === 1, 13003, '修改条形码失败');
    }

    /**
     * delete barcode
     *
     * @return {promise} deleted barcode
     * @memberof fileController
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      ctx.registerPermission(); // 是否已经登录
      const { id } = await ctx.verify(destroyRule, ctx.params);
      const isExist = await service.file.findById(id);
      ctx.assert(isExist, 13001, '该条形码不存在');
      ctx.oneselfPermission(isExist.creator); // 被删除的条形码是否是自己创建的
      const result = await service.file.destroy(
        {
          _id: id,
        },
        false,
        true
      );
      ctx.error(result.ok === 1, 13002, '条形码删除失败');
      ctx.jsonBody = isExist;
    }
  }
  return barcodeController;
};
