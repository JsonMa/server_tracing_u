const fs = require('fs');
const QRCode = require('qr-image');
const compressing = require('compressing');

module.exports = (app) => {
  /**
   * 贺卡相关路由
   *
   * @class CardController
   * @extends {app.Controller}
   */
  class CardController extends app.Controller {
    /**
     * 参数规则-贺卡列表
     *
     * @readonly
     * @memberof CardController
     */
    get indexRule() {
      return {
        properties: {
          status: {
            type: 'string',
            enum: ['NONBLANK', 'BLANK'],
          },
          category_id: this.ctx.helper.rule.uuid,
          user_id: this.ctx.helper.rule.uuid,
          ...this.ctx.helper.rule.pagination,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-贺卡详情
     *
     * @readonly
     * @memberof CardController
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
     *  参数规则-修改贺卡
     *
     * @readonly
     * @memberof CardController
     */
    get updateRule() {
      return {
        properties: {
          id: this.ctx.helper.rule.uuid,
          voice_id: this.ctx.helper.rule.uuid,
          video_url: {
            type: 'string',
            maxLength: 128,
            minLength: 1,
          },
          cover_id: this.ctx.helper.rule.uuid,
          category_id: this.ctx.helper.rule.uuid,
          blessing: {
            type: 'string',
            maxLength: 50,
            minLength: 1,
          },
          union_id: {
            type: 'string',
            maxLength: 36,
            minLength: 1,
          },
          editor_info: {
            properties: {
              nick_name: {
                type: 'string',
              },
              avatar_url: {
                type: 'string',
              },
            },
            required: ['nick_name', 'avatar_url'],
            additionalProperties: false,
          },
          picture_id: this.ctx.helper.rule.uuid,
          status: {
            type: 'string',
            enum: ['NONBLANK', 'BLANK'],
          },
          background_id: this.ctx.helper.rule.uuid,
        },
        required: ['id', 'union_id', 'editor_info'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-删除贺卡
     *
     * @readonly
     * @memberof CardController
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
     * 参数规则-批量创建贺卡
     *
     * @readonly
     * @memberof CardController
     */
    get createRule() {
      return {
        properties: {
          order_id: this.ctx.helper.rule.uuid,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 获取贺卡列表
     *
     * @memberof CardController
     * @returns {promise} 贺卡列表
     */
    async index() {
      const { ctx, indexRule } = this;
      const { card } = ctx.service;
      ctx.authPermission();
      const {
        user_id: userId,
        sort,
        start,
        count,
        status,
        category_id: categoryId,
      } = await ctx.validate(indexRule, ctx.helper.preprocessor.pagination);

      // 获取贺卡列表
      const cards = await card.fetch(userId, status, categoryId, start, count, sort);

      ctx.jsonBody = Object.assign({
        start,
        count: cards.count,
        items: cards.rows,
      });
    }

    /**
     * 获取贺卡详情
     *
     * @memberof CardController
     * @returns {promise} 贺卡详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);

      const { id } = ctx.params;
      const card = await service.card.getByIdOrThrow(id);
      const { category_id: categoryId } = card;
      const category = categoryId ? await service.cardCategory.getByIdOrThrow(categoryId) : null;
      if (card) card.click += 1;
      await card.save();

      ctx.jsonBody = {
        card,
        category,
      };
    }

    /**
     * 增加贺卡
     *
     * @memberof CardController
     * @returns {promise} 批量新建的贺卡
     */
    async create() {
      const { ctx, service, createRule } = this;
      const { order_id: orderId } = await ctx.validate(createRule);
      let card;
      if (orderId) {
        // ctx.adminPermission();

        // 批量创建贺卡
        const order = await app.model.Order.findById(orderId);
        ctx.error(order, '订单不存在', 20001);
        ctx.error(order.status === 'PAYED', '未完成支付，无法批量生成贺卡', 17013);

        const { count, commodity_id: commodityId, user_id: userId } = order;
        const commodity = await service.commodity.getByIdOrThrow(commodityId);
        const { quata, category_id: categoryId } = commodity;
        const commodityCategory = await service.commodityCategory.getByIdOrThrow(categoryId); // eslint-disable-line
        ctx.error(commodityCategory.auto_charge === false, '该商品类型无法批量生成贺卡', 17014);
        ctx.error(quata, '该商品无二维码额度', 17015);

        const cardsArray = [];
        // eslint-disable-next-line
        for (let i = 0; i < count * quata; i++) {
          cardsArray.push({ user_id: userId });
        }
        const cards = await app.model.Card.bulkCreate(cardsArray);
        const filePath = `${app.baseDir}/files/${orderId}`;
        const gzipFilePath = `${app.baseDir}/files/${orderId}.gz`;
        const isExists = fs.existsSync(gzipFilePath);
        ctx.assert(!isExists, '该压缩文件已存在', 24000);
        fs.mkdirSync(filePath);

        cards.forEach((item) => {
          if (item.id) {
            const generateQR = QRCode.image(
              `https://buildupstep.cn/public/two_dimension_code?id=${item.id}`,
              { type: 'png' },
            );
            generateQR.pipe(fs.createWriteStream(`${filePath}/${item.id}.png`));
          }
        });

        // 文件夹压缩
        await compressing.tar
          .compressDir(filePath, gzipFilePath)
          .then(async () => {
            const { size } = fs.statSync(gzipFilePath);
            const gzipFile = await app.model.File.create({
              name: orderId,
              size,
              type: 'application/x-gzip',
              path: gzipFilePath,
            });

            // 更新order信息
            order.compressed_id = gzipFile.id;
            await order.save();
            // 删除原有的文件夹
            // fs.rmdirSync(filePath);

            ctx.jsonBody = {
              gzip_id: gzipFile.id,
              cards,
            };
          })
          .catch((err) => {
            throw err;
          });
      } else {
        // ctx.authPermission();
        const { id } = ctx.state.auth.user;

        // 创建贺卡
        const user = await service.user.getByIdOrThrow(id);
        ctx.error(user.card_num >= 1, '创建贺卡失败，剩余数量小于1', 17009);
        card = await service.card.create(id);
        if (card) {
          user.card_num -= 1;
          await user.save();
        }
        ctx.jsonBody = card;
      }
    }

    /**
     * 修改贺卡
     *
     * @memberof CardController
     * @returns {promise} 被修改的贺卡
     */
    async update() {
      const { ctx, service, updateRule } = this;
      await ctx.validate(updateRule);

      const {
        voice_id: voiceId,
        video_url: videoUrl,
        cover_id: coverId,
        picture_id: pictureId,
        background_id: backgroundId,
        category_id: categoryId,
        union_id: code,
      } = ctx.request.body;
      const card = await service.card.getByIdOrThrow(ctx.params.id);
      const openidResult = await service.wechat.openid(code);

      ctx.error(openidResult.data.openid, 'openid获取失败', 21001);
      ctx.error(
        card.status === 'BLANK' || openidResult.data.openid === card.union_id,
        '贺卡已经被编辑过，不能再次编辑',
        17002,
      );

      // 验证贺卡分类是否存在
      /* istanbul ignore else */
      if (categoryId) await service.cardCategory.getByIdOrThrow(categoryId);

      // 验证图片是否存在
      /* istanbul ignore else */
      if (pictureId) {
        const file = await service.file.getByIdOrThrow(pictureId);
        ctx.error(!!~file.type.indexOf('image/'), '照片非图片类型', 17010, 400); // eslint-disable-line
      }

      /* istanbul ignore else */
      if (voiceId) {
        const file = await service.file.getByIdOrThrow(voiceId);
        ctx.error(!!~file.type.indexOf('audio/'), '录音文件非音频类型', 17003, 400); // eslint-disable-line
      }

      /* istanbul ignore else */
      if (videoUrl) ctx.error(!!~videoUrl.indexOf('.mp4'), '录像文件地址无效', 17006, 400); // eslint-disable-line

      /* istanbul ignore else */
      if (coverId) {
        const file = await service.file.getByIdOrThrow(coverId);
        ctx.error(!!~file.type.indexOf('image/'), '录像封面非图片类型', 17007, 400); // eslint-disable-line
      }

      /* istanbul ignore else */
      if (backgroundId) {
        const file = await service.file.getByIdOrThrow(backgroundId);
        ctx.error(!!~file.type.indexOf('image/'), '贺卡背景非图片类型', 17008, 400); // eslint-disable-line
      }

      // 贺卡更新
      ctx.request.body.union_id = openidResult.data.openid;
      Object.assign(card, ctx.request.body);
      await card.save();

      ctx.jsonBody = card;
    }

    /**
     * 删除贺卡
     *
     * @memberof CardController
     * @returns {promise} 删除的贺卡
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      ctx.adminPermission();

      // query参数验证
      const { id } = await ctx.validate(destroyRule);

      // 查询并删除指定的贺卡
      await service.card.getByIdOrThrow(id);
      const deletedCard = await service.card.delete(id);
      const { voice_id: voiceId, cover_id: coverId, picture_id: pictureId } = deletedCard;

      /* istanbul ignore next */
      if (voiceId) await service.file.delete(voiceId);
      /* istanbul ignore next */
      if (coverId) await service.file.delete(coverId);
      /* istanbul ignore next */
      if (pictureId) await service.file.delete(pictureId);

      ctx.jsonBody = deletedCard;
    }
  }

  return CardController;
};
