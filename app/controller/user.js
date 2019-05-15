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
          role_type: {
            $ref: 'schema.definition#/role_type',
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
          role_type: {
            $ref: 'schema.definition#/role_type',
          },
          enable: {
            type: 'boolean',
          },
          inviter: {
            $ref: 'schema.definition#/oid',
          },
          name: {
            $ref: 'schema.definition#/name',
          },
          phone: {
            $ref: 'schema.definition#/mobile',
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
      const { ctx, indexRule } = this;
      const { generateSortParam } = ctx.helper.pagination;
      ctx.checkPermission(['platform']);

      const {
        enable,
        role_type,
        limit = 10,
        offset = 0,
        sort = '-created_at',
      } = await ctx.verify(indexRule, ctx.request.query);

      const query = {};
      if (enable) query.enable = enable;
      if (role_type) query.role_type = role_type;
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
     * 创建用户
     *
     * @memberof UserController
     * @return {promise} 新建的用户
     */
    async create() {
      const { ctx, service, createRule } = this;
      const { openid, token } = ctx.loginPermission();
      await ctx.verify(createRule, ctx.request.body);

      const { role_type, role_id } = ctx.request.body;
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
      // 验证用户是否存在
      const userData = ctx.request.body[role_type];
      ctx.error(userData, 11007, '未找到属于该用户类型的数据');
      const query = {};
      query[`${role_type}.name`] = userData.name;
      const user = await service.user.findOne(query);
      ctx.error(!user, 10003, '创建失败，该用户名已存在', 400);
      let targetData = {};
      targetData[role_type] = userData;
      targetData = Object.assign(targetData, {
        role_type,
        role_id,
        openid,
      });

      // 创建用户
      const createdUser = await service.user.create(targetData);
      if (createdUser) {
        const { role_type, _id, role_id } = createdUser;
        const isRegistered = true;
        const sessionData = Object.assign(ctx.state.auth, {
          isRegistered,
          role_type,
          role_id,
          user_id: _id,
        });
        await ctx.app.redis.set(
          `token:${token}`,
          JSON.stringify(sessionData),
          'EX',
          7200
        );
      }
      ctx.jsonBody = createdUser;
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
      const { ctx, service, updateRule } = this;
      const { id } = await ctx.verify(
        updateRule,
        Object.assign(ctx.params, ctx.request.body)
      );
      ctx.checkPermission(['platform']);

      const user = await service.user.findById(id);
      ctx.assert(user, '不存在该用户', 404);
      await service.user.update(
        {
          _id: id,
        },
        ctx.request.body
      );

      ctx.jsonBody = Object.assign(user, ctx.request.body);
    }
  }
  return UserController;
};
