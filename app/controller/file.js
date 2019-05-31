'use strict';

const fs = require('fs');
const gm = require('gm');
const path = require('path');
module.exports = app => {
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
            items: {
              type: 'object',
              $ref: 'schema.file#',
            },
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
     * 上传文件
     *
     * @memberof fileController
     * @return {promise} 上传的文件
     */
    async upload() {
      const { ctx, uploadRule } = this;
      await ctx.verify(uploadRule, ctx.request.files);
      const { files } = ctx.request;

      const targetFiles = files.map(item => {
        return {
          name: item.name,
          size: item.size,
          type: item.type,
          path: item.path,
        };
      });
      const file = await ctx.service.file.create(targetFiles[0]);
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
     * @return {promise} 文件详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      const file = await service.file.findById(id);
      ctx.assert(file, '未找到相关资源', 404);
      const { range: requestRange } = ctx.headers;
      const { size } = fs.statSync(file.path);
      const fileSize = !!~file.type.indexOf('image') ? size : file.size; // eslint-disable-line

      if (requestRange && file.type.includes('video')) {
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
     * @return {promise} 缩略图
     */
    async thumbnail() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      const file = await service.file.findById(id);

      ctx.assert(file, '未找到相关资源', 404);
      ctx.assert(
        file.type.includes('image'),
        '非图片类型文件，不存在缩略图',
        400
      );
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
     * @return {promise} 被删除的文件
     * @memberof fileController
     */
    async delete() {
      const { ctx, service, showRule } = this;
      const { id } = await ctx.verify(showRule, ctx.params);
      const file = await service.file.findById(id);
      ctx.assert(file, '未找到相关资源', 404);

      const result = await service.file.destroy(
        {
          _id: id,
        },
        false,
        true
      );
      ctx.assert(result.ok === 1, '删除失败', 500);
      fs.unlinkSync(file.path);
      ctx.jsonBody = file;
    }
  }
  return fileController;
};
