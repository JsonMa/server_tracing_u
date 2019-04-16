// @ts-nocheck
const fs = require('fs');
const gm = require('gm');
const path = require('path');

module.exports = (app) => {
  /**
   * file相关Controller
   *
   * @class fileController
   * @extends {app.Controller}
   */
  class fileController extends app.Controller {
    /**
     * 参数验证-上传文件
     *
     * @readonly
     * @memberof fileController
     */
    get uploadRule() {
      return {
        properties: {
          files: {
            type: 'array',
            items: this.ctx.helper.rule.file,
          },
        },
        required: ['files'],
        $async: true,
        additionalProperties: false,
      };
    }
    /**
     * 参数验证-获取文件
     *
     * @readonly
     * @memberof fileController
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
     * 上传文件
     *
     * @memberof fileController
     * @returns {promise} 上传的文件
     */
    async upload() {
      const { ctx, uploadRule } = this;
      const [files] = ctx.request.files;
      await ctx.validate(uploadRule);

      let cosResult = null;
      if (~files.type.indexOf('mp4')) { // eslint-disable-line
        const config = app.config.tencent;
        const {
          fileType,
          notifyUrl,
          secretId,
          secretKey,
        } = config;
        const VodUploadApi = ctx.helper.vodUploadApi;
        const filePath = path.join(`${app.baseDir}`, files.path);
        const slicePage = 512 * 1024;
        const api = new VodUploadApi(config);

        // 安全凭证
        api.SetSecretId(secretId);
        api.SetSecretKey(secretKey);
        api.SetRegion('cd');
        cosResult = await new Promise((resolve, reject) => {
          api.UploadVideo(filePath, files.name, fileType, slicePage, notifyUrl, (err, data) => {
            if (err) reject(err);
            resolve(data);
          });
        });
        fs.unlinkSync(filePath);
        ctx.error(cosResult.url, '视频上传失败', 16004);

        ctx.jsonBody = {
          url: cosResult.url,
        };
        return;
      }

      // 非视频文件
      const file = await app.model.File.create({
        name: files.name,
        size: files.size,
        type: files.type,
        path: files.path,
      });

      ctx.jsonBody = {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }

    /**
     * 获取文件
     *
     * @memberof fileController
     * @returns {promise} 文件详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);
      const file = await service.file.getByIdOrThrow(ctx.params.id);
      const { range: requestRange } = ctx.headers;
      const { size } = fs.statSync(file.path);
      const fileSize = !!~file.type.indexOf('image') ? size : file.size; // eslint-disable-line

      if (requestRange && ~file.type.indexOf('video')) { // eslint-disable-line
        const range = ctx.helper.video.range(ctx.headers.range, fileSize);
        if (range) {
          const { start, end } = range;
          ctx.set({
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Type': file.type,
            'Content-Length': fileSize,
          });
          ctx.status = 206;
          ctx.body = fs.createReadStream(file.path, {
            start,
            end,
          });
        } else ctx.status = 416;
      } else {
        ctx.body = fs.createReadStream(file.path);
        ctx.status = 200;

        ctx.set({
          'Content-Type': file.type,
          'Content-Length': fileSize,
        });
      }
    }

    /**
     * 获取图片缩略图
     *
     * @memberof fileController
     * @returns {promise} 缩略图
     */
    async thumbnail() {
      const { ctx, service, showRule } = this;
      await ctx.validate(showRule);
      const file = await service.file.getByIdOrThrow(ctx.params.id);

      ctx.error(!!~file.type.indexOf('image'), '非图片类型文件，不存在缩略图', 16003); // eslint-disable-line
      gm(fs.createReadStream(file.path))
        .thumbnail(160, 160)
        .stream((err, data) => {
          if (err) throw err;
          else {
            ctx.body = data;
            ctx.attachment(file.name);
            ctx.set({
              'Content-Type': file.type,
              'Cache-Control': 'max-age=8640000',
            });
          }
        });
    }

    /**
     * 删除文件
     *
     * @returns {promise} 被删除的文件
     * @memberof fileController
     */
    async delete() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.validate(showRule);
      await service.file.getByIdOrThrow(id);

      const file = await ctx.service.file.delete(id);
      ctx.jsonBody = file;
    }
  }
  return fileController;
};

