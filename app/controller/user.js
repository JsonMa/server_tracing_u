'use strict';

module.exports = app => {
  /**
   * User 相关路由
   *
   * @class UserController
   * @extends {app.Controller}
   */
  class UserController extends app.Controller {
    /**
     * 获取用户列表
     *
     * @readonly
     * @memberof UserController
     */
    get indexRule() {
      return {
        properties: {
          enable: {
            type: 'boolean',
          },
          sub_level: {
            type: 'boolean',
          },
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-用户详情
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
     * 参数规则-创建用户
     *
     * @readonly
     * @memberof UserController
     */
    get createRule() {
      return {
        $async: true,
        $merge: {
          source: {
            $ref: 'schema.user#',
          },
          with: {
            required: ['role_type', 'role_id'],
            additionalProperties: false,
          },
        },
      };
    }

    /**
     *  参数规则-修改用户
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
          banner: {
            $ref: 'schema.definition#/oid',
          },
          operation: {
            type: 'string',
            enum: ['banner', 'state'],
          },
          state: {
            type: 'string',
            enum: ['passed', 'rejected', 'unreview'],
          },
          rejectReason: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
          },
        },
        $async: true,
        required: ['id', 'operation'],
        additionalProperties: false,
      };
    }

    /**
     * 获取用户列表
     *
     * @memberof UserController
     * @return {promise} 用户列表
     */
    async index() {
      const {
        ctx,
        indexRule,
      } = this;
      const {
        generateSortParam,
      } = ctx.helper.pagination;
      const {
        user_id,
      } = ctx.registerPermission();

      const {
        enable,
        sub_level,
        limit = 10,
        offset = 0,
        sort = '-created_at',
      } = await ctx.verify(indexRule, ctx.request.query);

      const query = {};
      if (enable) query.enable = enable;
      if (sub_level) query.inviter = user_id;
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
      const {
        ctx,
        showRule,
      } = this;
      const {
        id,
      } = await ctx.verify(showRule, ctx.params);
      const {
        user_id,
      } = ctx.oneselfPermission(id);
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
     * 获取该用户下的经销商信息
     *
     * @memberof UserController
     * @return {undefined}
     */
    async business() {
      const {
        ctx,
        showRule,
      } = this;
      const {
        id,
      } = await ctx.verify(showRule, ctx.params);
      const {
        user_id,
      } = ctx.oneselfPermission(id);
      const userInfo = await ctx.service.user.findMany({
        inviter: user_id,
        role_type: 'business',
      });
      ctx.jsonBody = userInfo;
    }

    /**
     * 创建用户
     *
     * @memberof UserController
     * @return {promise} 新建的用户
     */
    async create() {
      const {
        ctx,
        service,
        createRule,
      } = this;
      const {
        openid,
        token,
      } = ctx.loginPermission();
      await ctx.verify(createRule, ctx.request.body);
      const isUserExist = await ctx.service.user.findOne(openid);
      ctx.error(isUserExist.role_type === 'unauthed', 10004, '注册失败，该用户已注册');
      const {
        role_type,
        role_id,
      } = ctx.request.body;
      switch (role_type) {
        case 'salesman':
          ctx.error(role_id >= 40 && role_id < 50, 11006, '用户类型与id不匹配');
          break;
        case 'courier':
          ctx.error(role_id >= 50 && role_id < 60, 11006, '用户类型与id不匹配');
          break;
        case 'factory':
          ctx.error(role_id >= 20 && role_id < 30, 11006, '用户类型与id不匹配');
          break;
        case 'business':
          ctx.error(role_id >= 30 && role_id < 40, 11006, '用户类型与id不匹配');
          break;
        case 'platform':
          ctx.error(role_id > 0 && role_id < 10, 11006, '用户类型与id不匹配');
          break;
        default:
          ctx.error(role_id === 60, 11006, '用户类型与id不匹配');
          break;
      }
      const userData = ctx.request.body[role_type];
      ctx.error(userData, 11007, '未找到属于该用户类型的数据');
      const query = {};
      query[`${role_type}.name`] = userData.name;
      const user = await service.user.findOne(query); // 验证用户是否存在
      ctx.error(!user, 10003, '创建失败，该用户名已存在', 400);
      let targetData = {};
      targetData[role_type] = userData;
      targetData = Object.assign(targetData, {
        role_type,
        role_id,
        openid,
      });

      // 用户注册
      const {
        nModified,
      } = await service.user.update({
        openid,
      },
      targetData);
      ctx.error(nModified === 1, 11008, '用户注册失败');
      const isRegistered = true;
      const sessionData = Object.assign(ctx.state.auth, {
        isRegistered,
        role_type,
        role_id,
      });
      await ctx.app.redis.set(
        `token:${token}`,
        JSON.stringify(sessionData),
        'EX',
        72000
      );
      ctx.jsonBody = targetData;
    }

    /**
     * 获取用户详情
     *
     * @memberof UserController
     * @return {promise} 用户详情
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
      const {
        ctx,
        service,
        updateRule,
      } = this;
      const {
        id,
        operation,
        banner,
        state,
        rejectReason,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.params, ctx.request.body)
      );
      const isUserExist = await ctx.service.user.findById(id);
      ctx.error(isUserExist, 11008, '未找到该用户');
      const targetParams = {};
      if (operation === 'banner') {
        ctx.oneselfPermission(id);
        ctx.error(
          ['business', 'factory'].includes(isUserExist.role_type),
          11009,
          '非商户或厂家类型用户不能上传banner图'
        );
        // 验证banner是否存在
        const isBannerExist = await ctx.service.file.findById(banner);
        ctx.error(isBannerExist, 11010, '上传的banner图不存在');
        targetParams.business = isUserExist.business;
        targetParams.business.banner = banner;
      } else {
        // 修改用户审核状态
        ctx.checkPermission(['platform']);
        ctx.error(state, 11011, 'state参数为必填项');
        ctx.error(
          ['passed', 'rejected'].includes(state),
          11012,
          'state参数为passed或rejected'
        );
        targetParams.state = state;
        if (state === 'rejected') {
          ctx.error(rejectReason, 11012, 'rejectReason为必填项');
          targetParams.rejectReason = rejectReason;
        }
      }

      await service.user.update({
        _id: id,
      },
      targetParams
      );

      ctx.jsonBody = Object.assign(isUserExist, targetParams);
    }
  }
  return UserController;
};
