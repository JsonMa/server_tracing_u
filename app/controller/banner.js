// @ts-nocheck
module.exports = (app) => {
  /**
   * banner相关Controller
   *
   * @class bannerController
   * @extends {app.Controller}
   */
  class bannerController extends app.Controller {
    /**
     * 参数验证-删除banner
     *
     * @readonly
     * @memberof bannerController
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
     * 参数验证-增加banner
     *
     * @readonly
     * @memberof bannerController
     */
    get createRule() {
      return {
        properties: {
          cover_id: this.ctx.helper.rule.uuid,
          video_url: {
            type: 'string',
            maxLength: 128,
            minLength: 1,
          },
        },
        required: ['cover_id', 'video_url'],
        $async: true,
        additionalProperties: false,
      };
    }
    /**
     * 参数验证-修改banner
     * @readonly
     * @memberof bannerController
     */
    get updateRule() {
      return {
        properties: {
          cover_id: this.ctx.helper.rule.uuid,
          video_url: {
            type: 'string',
            maxLength: 60,
            minLength: 1,
          },
          status: {
            type: 'string',
            enum: [
              'ON',
              'OFF',
            ],
          },
          id: this.ctx.helper.rule.uuid,
        },
        required: ['id'],
        $async: true,
        additionalProperties: false,
      };
    }
    /**
     * 获取所有banner
     *
     * @memberof bannerController
     * @returns {array} 所有的banner
     */
    async index() {
      const { ctx } = this;
      const banners = await app.model.Banner.findAndCountAll();

      ctx.jsonBody = {
        items: banners.rows,
        count: banners.count,
      };
    }

    /**
     * 新增banner
     *
     * @memberof bannerController
     * @returns {object} 新增的banner
     */
    async create() {
      const { ctx, service, createRule } = this;
      ctx.adminPermission();
      await ctx.validate(createRule);
      const { cover_id: coverId, video_url: videoUrl } = ctx.request.body;

      const total = await app.model.Banner.count();
      ctx.error(total <= 5, 'banner数量不能大于5', 26002, 400);

      // 验证cover_id是否存在，且为图片类型;
      const image = await service.file.getByIdOrThrow(coverId);
      ctx.error(!!~image.type.indexOf('image/'), '视频封面非图片类型文件', 11001, 400); // eslint-disable-line
      ctx.error(!!~videoUrl.indexOf('.mp4'), '非视频类型文件', 11002, 400); // eslint-disable-line

      const createdBanner = await app.model.Banner.create({ cover_id: coverId, video_url: videoUrl }); // eslint-disable-line

      ctx.jsonBody = createdBanner;
    }

    /**
     * 删除banner
     *
     * @memberof bannerController
     * @returns {object} 被删除的banner
     */
    async destroy() {
      const { ctx, destroyRule } = this;
      ctx.adminPermission();
      await ctx.validate(destroyRule);

      // 验证banner是否存在
      const banner = await app.model.Banner.findById(ctx.params.id);
      ctx.error(banner, 'banner不存在', 26000);
      banner.destroy();

      ctx.jsonBody = banner;
    }
    /**
     * 修改banner
     *
     * @memberof bannerController
     * @returns {object} 修改后的banner
     */
    async update() {
      const { ctx, service, updateRule } = this;
      ctx.adminPermission();
      await ctx.validate(updateRule);
      const { cover_id: coverId, video_url: videoUrl } = ctx.request.body;

      // 验证cover_id是否存在，且为图片类型;
      if (coverId) {
        const image = await service.file.getByIdOrThrow(coverId);
        ctx.error(!!~image.type.indexOf('image/'), '视频封面非图片类型文件', 11001, 400); // eslint-disable-line      
      }
      if (videoUrl) ctx.error(!!~videoUrl.indexOf('.mp4'), '非视频类型文件', 11002, 400); // eslint-disable-line

      // 验证banner是否存在
      const banner = await app.model.Banner.findById(ctx.params.id);
      ctx.error(banner, 'banner不存在', 11003);
      Object.assign(banner, ctx.request.body);
      await banner.save();

      ctx.jsonBody = banner;
    }
  }
  return bannerController;
};

