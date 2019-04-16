
module.exports = (app) => {
  /**
   * 贺卡分类路由
   *
   * @class CardCategoryController
   * @extends {app.Controller}
   */
  class CardCategoryController extends app.Controller {
    /**
     * 参数规则-贺卡分类列表
     *
     * @readonly
     * @memberof CardCategoryController
     */
    get indexRule() {
      return {
        properties: {
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-创建贺卡分类
     *
     * @readonly
     * @memberof CardCategoryController
     */
    get createRule() {
      return {
        properties: {
          name: {
            type: 'string',
            maxLength: 20,
            minLength: 1,
          },
          background_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
          music_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
          blessings: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 64,
              minLength: 1,
            },
          },
        },
        required: ['name'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-贺卡详情
     *
     * @readonly
     * @memberof CardCategoryController
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
     *  参数规则-修改贺卡分类
     *
     * @readonly
     * @memberof CardCategoryController
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
          background_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
          music_ids: {
            type: 'array',
            items: this.ctx.helper.rule.uuid,
          },
          blessings: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 64,
              minLength: 1,
            },
          },
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-删除贺卡分类
     *
     * @readonly
     * @memberof CardCategoryController
     */
    get destroyRule() {
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
     * 获取贺卡分类列表
     *
     * @memberof CardCategoryController
     * @returns {array} 贺卡分类列表
     */
    async index() {
      const { ctx, service, indexRule } = this;

      const {
        sort, start, count,
      } = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);
      const cardCategories = await service.cardCategory.fetch(start, count, sort);

      ctx.jsonBody = {
        count: cardCategories.count,
        start,
        items: cardCategories.rows,
      };
    }
    /**
     * 获取贺卡分类详情
     *
     * @memberof CardCategoryController
     * @returns {promise} 贺卡详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);

      const { id } = ctx.params;
      const category = await service.cardCategory.getByIdOrThrow(id);

      ctx.jsonBody = category;
    }

    /**
     * 创建贺卡分类
     *
     * @memberof CardCategoryController
     * @returns {object} 创建的贺卡分类
     */
    async create() {
      const { ctx, service, createRule } = this;
      ctx.adminPermission();
      await ctx.validate(createRule);
      const { background_ids: backgroundIds, name, music_ids: musicIds, blessings } = ctx.request.body; // eslint-disable-line

      // 验证背景图片是否存在
      /* istanbul ignore else */
      if (backgroundIds) {
        const files = await service.file.count(backgroundIds, 'image');
        ctx.error(files.count === backgroundIds.length, '贺卡背景图片重复/丢失或包含非图片类型文件', 19001);
      }

      // 验证背景音乐是否存在
      /* istanbul ignore else */
      if (musicIds) {
        const files = await service.file.count(musicIds, 'audio');
        ctx.error(files.count === musicIds.length, '贺卡背景音乐重复/丢失或包含非音频类型文件', 19002);
      }

      await service.cardCategory.isExisted(name);
      const cardCategory = await app.model.CardCategory.create(ctx.request.body);

      ctx.jsonBody = cardCategory;
    }

    /**
     * 修改贺卡分类
     *
     * @memberof CardCategoryController
     * @returns {object} 修改的贺卡分类
     */
    async update() {
      const { ctx, service, updateRule } = this;
      ctx.adminPermission();
      await ctx.validate(updateRule);
      const { background_ids: backgroundIds, name, music_ids: musicIds, blessings } = ctx.request.body; // eslint-disable-line

      // 验证背景图片是否存在
      /* istanbul ignore else */
      if (backgroundIds) {
        const files = await service.file.count(backgroundIds, 'image');
        ctx.error(files.count === backgroundIds.length, '贺卡背景图片重复/丢失或包含非图片类型文件', 19001);
      }

      // 验证背景音乐是否存在
      /* istanbul ignore else */
      if (musicIds) {
        const files = await service.file.count(musicIds, 'audio');
        ctx.error(files.count === musicIds.length, '贺卡背景音乐重复/丢失或包含非音频类型文件', 19002);
      }

      if (name) await service.cardCategory.isExisted(name);

      const cardCategory = await service.cardCategory.getByIdOrThrow(ctx.params.id);
      Object.assign(cardCategory, ctx.request.body);
      await cardCategory.save();

      ctx.jsonBody = cardCategory;
    }

    /**
     * 删除贺卡分类
     *
     * @memberof CardCategoryController
     * @returns {array} 删除的贺卡分类
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      ctx.adminPermission();
      await ctx.validate(destroyRule);

      // 查询并删除贺卡分类
      const { id } = ctx.params;
      await service.cardCategory.getByIdOrThrow(id);

      // 验证分类是否存在关联贺卡
      await service.cardCategory.isEmpty(id);
      const cardCategory = await service.cardCategory.delete(id);

      ctx.jsonBody = cardCategory;
    }
  }
  return CardCategoryController;
};

