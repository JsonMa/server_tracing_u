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
            $ref: 'schema.definition#/name',
          },
          description: {
            type: 'string',
          },
          manufacturer: {
            $ref: 'schema.definition#/oid',
          },
          attributes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  $ref: 'schema.definition#/name',
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
      const { barcode } = await ctx.verify(createRule, ctx.request.body);

      const isExit = await ctx.service.barcode.findOne({
        barcode,
      });
      ctx.error(isExit, 13000, ' 新增条形码失败，该条形码已存在');
      const createdBar = await ctx.service.barcode.create(ctx.request.body);
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
      const { barcode } = await ctx.verify(showRule, ctx.params);
      const isExit = await service.barcode.findOne({
        barcode,
      });
      ctx.assert(isExit, 13001, '该条形码不存在');
      ctx.jsonBody = isExit;
    }

    /**
     * update barcode
     *
     * @memberof barcodeController
     * @return {promise} updated barcode
     */
    async update() {
      const { ctx, service, createRule } = this;
      const { barcode } = await ctx.verify(createRule, ctx.request.body);

      const isExit = service.barcode.findOne({
        barcode,
      });
      ctx.assert(isExit, 13001, '该条形码不存在');

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
      const { id } = await ctx.verify(destroyRule, ctx.params);
      const isExit = await service.file.findById(id);
      ctx.assert(isExit, 13001, '该条形码不存在');

      const result = await service.file.destroy(
        {
          _id: id,
        },
        false,
        true
      );
      ctx.error(result.ok === 1, 13002, '条形码删除失败');
      ctx.jsonBody = isExit;
    }
  }
  return barcodeController;
};
