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
      const {
        ctx,
        indexRule,
      } = this;
      const {
        generateSortParam,
      } = ctx.helper.pagination;

      const {
        enable,
        role_type,
        limit = 10,
        offset = 0,
        sort = '-created_time',
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
      const {
        ctx,
        service,
        createRule,
      } = this;
      await ctx.verify(createRule, ctx.request.body);

      const {
        role_type,
        role_id,
      } = ctx.request.body;
      // 验证用户是否存在
      const userData = ctx.request.body[role_type];
      // 从登录信息中获取unionID并存入数据库
      const query = {};
      query[`${role_type}.name`] = userData.name;
      const user = await service.user.findOne(query);
      ctx.error(!user, 10003, '创建失败，该用户名已存在', 400);
      let targetData = {};
      targetData[role_type] = userData;
      targetData = Object.assign(targetData, {
        role_type,
        role_id,
      });

      // 创建用户
      const createdUser = await service.user.create(ctx.request.body);
      ctx.jsonBody = createdUser;
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
      const {
        ctx,
        service,
        updateRule,
      } = this;
      const {
        id,
        enable,
        inviter,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.params, ctx.request.body)
      );

      const user = await service.user.findById(id);
      ctx.assert(user, '不存在该用户', 404);
      const updateData = {};
      if (enable) updateData.enable = enable;
      if (inviter) updateData.inviter = inviter;
      await service.user.update({
        _id: id,
      },
      updateData
      );

      ctx.jsonBody = Object.assign(user, updateData);
    }
  }
  return UserController;
};
