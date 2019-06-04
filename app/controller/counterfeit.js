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
     * 获取报警列表
     *
     * @memberof UserController
     * @return {promise} 用户列表
     */
    async index() {
      const { ctx, indexRule } = this;
      const { generateSortParam } = ctx.helper.pagination;
      ctx.checkPermission('platform');

      const {
        enable,
        role_type,
        state = 'unreview',
        limit = 10,
        offset = 0,
        sort = '-created_at',
      } = await ctx.verify(indexRule, ctx.request.query);

      const query = {};
      if (enable) query.enable = enable;
      if (role_type) {
        query.role_type = role_type;
      } else {
        query.role_type = {
          $in: ['factory', 'business', 'courier', 'salesman'],
        };
      }
      if (state) query.state = state;
      const users = await ctx.service.user.findMany(query, null, {
        limit: parseInt(limit),
        skip: parseInt(offset),
        sort: generateSortParam(sort),
      });
      const count = await ctx.service.user.count(query);

      ctx.jsonBody = {
        data: users,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 用户统计信息
     *
     * @memberof UserController
     * @return {undefined}
     */
    async statistics() {
      const { ctx, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      const { user_id } = ctx.oneselfPermission(id);
      const totalTracings = await ctx.service.tracing.count({
        owner: user_id,
      });
      const unUsedTracings = await ctx.service.tracing.count({
        owner: user_id,
        isActive: false,
      });
      const barcodes = await ctx.service.barcode.count({
        creator: user_id,
      });
      const userInfo = await ctx.service.user.findById(user_id);
      ctx.error(userInfo && userInfo.state === 'passed', 10001, '找不到该用户');
      ctx.jsonBody = {
        data: {
          totalTracings,
          unUsedTracings,
          barcodes,
          userInfo,
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
            type: 'string',
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
      const isTracingExist = await ctx.service.tracing.findOne({
        $or: [
          {
            inner_code: key,
          },
          {
            outer_code: key,
          },
        ],
      });
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
        imagesCount.length === images.length,
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
     * 获取用户详情
     *
     * @memberof UserController
     * @return {promise} 用户详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      ctx.checkPermission(['platform', id]);
      const user = await service.user.findById(id);
      ctx.jsonBody = user;
    }

    /**
     * 修改用户
     *
     * @memberof CommodityController
     * @return {promise} 被修改用户信息
     */
    async update() {
      // 商户上传banner或平台管理员审核用户
      const { ctx, service, updateRule } = this;
      const { id, operation, banner, state } = await ctx.verify(
        updateRule,
        Object.assign(ctx.params, ctx.request.body)
      );
      const isUserExist = await ctx.service.user.findById(id);
      ctx.error(isUserExist, 11008, '未找到该用户');
      const targetParams = {};
      if (operation === 'banner') {
        const { role_type } = isUserExist;
        ctx.oneselfPermission(id);
        ctx.error(
          ['business', 'factory'].includes(role_type),
          11009,
          '非商户或厂家类型用户不能上传banner图'
        );
        // 验证banner是否存在
        const isBannerExist = await ctx.service.file.findById(banner);
        ctx.error(isBannerExist, 11010, '上传的banner图不存在');
        targetParams[role_type] = isUserExist[role_type];
        targetParams[role_type].banner = banner;
      } else {
        // 修改用户审核状态
        ctx.checkPermission(['platform']);
        ctx.error(state, 11011, 'state参数为必填项');
        ctx.error(
          isUserExist.state === 'unreview',
          11013,
          '审核失败，该用户不处于待审核状态'
        );
        ctx.error(
          ['passed', 'rejected'].includes(state),
          11012,
          'state参数为passed或rejected'
        );
        targetParams.state = state;
      }

      await service.user.update(
        {
          _id: id,
        },
        targetParams
      );

      ctx.jsonBody = Object.assign(isUserExist, targetParams);
    }
  }
  return CounterfeitController;
};
