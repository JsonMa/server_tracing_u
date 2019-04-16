const crypto = require('crypto');

module.exports = (app) => {
  /**
   * User 相关路由
   *
   * @class UserController
   * @extends {app.Controller}
   */
  class UserController extends app.Controller {
    /**
   * 获取 user orders 的参数规则
   *
   * @readonly
   * @memberof UserController
   */
    get indexRule() {
      return {
        properties: {
          name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          phone: this.ctx.helper.rule.phone,
          status: {
            type: 'string',
            enum: [
              'ON',
              'OFF',
            ],
          },
          cooperation: {
            type: 'string',
            enum: [
              'TRUE',
              'FALSE',
            ],
          },
          ...this.ctx.helper.rule.pagination,
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
          id: this.ctx.helper.rule.uuid,
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
        properties: {
          name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          phone: this.ctx.helper.rule.phone,
          password: {
            type: 'string',
            maxLength: 20,
            minLength: 6,
          },
        },
        required: ['phone', 'password'],
        $async: true,
        additionalProperties: false,
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
          id: this.ctx.helper.rule.uuid,
          name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          address: {
            properties: {
              location: {
                type: 'string',
                maxLength: 30,
                minLength: 1,
              },
              lon: {
                type: 'number',
              },
              lat: {
                type: 'number',
              },
            },
            required: ['location', 'lon', 'lat'],
            additionalProperties: false,
          },
          contact: this.ctx.helper.rule.phone,
          phone: this.ctx.helper.rule.phone,
          password: {
            type: 'string',
            maxLength: 20,
            minLength: 6,
          },
          avatar_id: this.ctx.helper.rule.uuid,
          url: this.ctx.helper.rule.uuid,
          status: {
            type: 'string',
            enum: [
              'ON',
              'OFF',
            ],
          },
          cooperation: {
            type: 'string',
            enum: [
              'TRUE',
              'FALSE',
            ],
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
     * 获取用户列表
     *
     * @memberof UserController
     * @returns {promise} 用户列表
     */
    async index() {
      const { ctx, indexRule } = this;
      const { user } = ctx.service;
      const {
        name, phone, status, cooperation, sort, start, count,
      } = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);

      // 获取用户
      const users = await user.fetch(name, phone, status, cooperation, start, count, sort); // eslint-disable-line

      ctx.jsonBody = Object.assign({
        start,
        count: users.count,
        items: users.rows,
      });
    }

    /**
     * 创建用户
     *
     * @memberof UserController
     * @returns {promise} 新建的用户
     */
    async create() {
      const { ctx, service, createRule } = this;
      await ctx.validate(createRule);

      const {
        name,
        phone,
        password,
      } = ctx.request.body;

      // 验证用户是否存在
      await service.user.isExisted(phone);

      // 创建用户
      const user = await service.user.create(
        name,
        phone,
        password,
      );

      ctx.jsonBody = user;
    }

    /**
     * 获取用户详情
     *
     * @memberof UserController
     * @returns {promise} 用户详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);
      const { id } = ctx.params;
      const user = await service.user.getByIdOrThrow(id);
      delete user.dataValues.password;

      const cards = await app.model.Card.findAndCountAll({
        where: {
          user_id: user.id,
        },
      });
      user.dataValues.cards = cards.count;
      let totalClick = 0;
      cards.rows.forEach((card) => {
        totalClick += card.click;
      });
      user.dataValues.click_total = totalClick;

      ctx.jsonBody = user;
    }

    /**
     * 修改用户
     *
     * @memberof CommodityController
     * @returns {promise} 被修改用户信息
     */
    async update() {
      const { ctx, service, updateRule } = this;
      await ctx.validate(updateRule);
      const {
        phone,
        password,
        avatar_id: avatarId,
        picture_ids: pictureIds,
      } = ctx.request.body;
      const { id } = ctx.params;

      // 当前用户只能修改自己信息
      ctx.userPermission(id);
      const user = await service.user.getByIdOrThrow(id);

      // 验证图片是否存在
      /* istanbul ignore else */
      if (pictureIds) {
        ctx.error(pictureIds.length <= 5 && pictureIds.length >= 1, '用户图片数量需在1~5张范围内', 15001);
        const files = await service.file.count(pictureIds, 'image');
        ctx.error(files.count === pictureIds.length, '用户图片重复/丢失或包含非图片类型文件', 15002);
      }

      // 验证头像是否存在
      /* istanbul ignore else */
      if (avatarId) await service.file.getByIdOrThrow(avatarId);

      // 密码
      /* istanbul ignore else */
      if (password) {
        const md5 = crypto.createHash('md5');
        ctx.request.body.password = md5.update(password).digest('hex');
      }

      // 手机号
      /* istanbul ignore else */
      if (phone) await service.user.isExisted(phone);

      // 修改用户
      Object.assign(user, ctx.request.body);
      await user.save();

      ctx.jsonBody = user;
    }

    /**
     * 修改二维码下载量
     *
     * @memberof UserController
     * @returns {promise} 被修改的用户
     */
    async updateQr() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);
      const { id } = ctx.params;
      const user = await service.user.getByIdOrThrow(id);

      user.jump_num += 1;
      await user.save();

      ctx.jsonBody = user;
    }
  }
  return UserController;
};
