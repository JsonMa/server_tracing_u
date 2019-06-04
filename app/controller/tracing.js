'use strict';
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const excel = require('excel4node');
const _ = require('lodash');
module.exports = app => {
  /**
   * 溯源码相关路由
   *
   * @class CommodityController
   * @extends {app.Controller}
   */
  class TracingController extends app.Controller {
    /**
     * 参数规则-溯源列表
     *
     * @readonly
     * @memberof CommodityController
     */
    get indexRule() {
      return {
        properties: {
          order: {
            $ref: 'schema.definition#/oid',
          },
          factory: {
            $ref: 'schema.definition#/oid',
          },
          owner: {
            $ref: 'schema.definition#/oid',
          },
          isActive: {
            type: 'boolean',
          },
          isConsumerReceived: {
            type: 'boolean',
          },
          isFactoryTracing: {
            type: 'boolean',
          },
          ...this.ctx.helper.pagination.rule,
        },
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-溯源详情
     *
     * @readonly
     * @memberof CommodityController
     */
    get showRule() {
      return {
        properties: {
          key: {
            type: 'string',
          },
        },
        required: ['key'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-创建溯源码
     *
     * @readonly
     * @memberof CommodityController
     */
    get createRule() {
      return {
        properties: {
          order: {
            $ref: 'schema.definition#/oid',
          },
        },
        required: ['order'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     *  参数规则-修改溯源码
     *
     * @readonly
     * @memberof CommodityController
     */
    get updateRule() {
      return {
        properties: {
          operation: {
            type: 'string',
            enum: ['send', 'receive', 'express', 'bind'],
          },
          key: {
            type: 'string',
          },
          record: {
            properties: {
              courier: {
                type: 'string',
              },
              express_name: {
                type: 'string',
              },
              express_no: {
                type: 'string',
              },
              reciver: {
                $ref: 'schema.definition#/oid',
              },
              reciver_type: {
                type: 'string',
                enum: ['consumer', 'business'],
              },
              reciver_name: {
                $ref: 'schema.definition#/name',
              },
              reciver_phone: {
                $ref: 'schema.definition#/mobile',
              },
              reciver_address: {
                type: 'string',
              },
              sender: {
                $ref: 'schema.definition#/oid',
              },
            },
            $async: true,
            additionalProperties: false,
          },
          products: {
            type: 'array',
            items: {
              $ref: 'schema.definition#/oid',
            },
          },
          tracing_products: {
            type: 'array',
            items: {
              $ref: 'schema.definition#/oid',
            },
          },
          isFactoryTracing: {
            type: 'boolean',
          },
        },
        required: ['operation'],
        $async: true,
        additionalProperties: false,
      };
    }

    /**
     * 参数规则-删除溯源码
     *
     * @readonly
     * @memberof CommodityController
     */
    get destroyRule() {
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
     * 获取溯源码列表
     *
     * @memberof CommodityController
     * @return {array} 溯源码列表
     */
    async index() {
      const { ctx, indexRule } = this;
      ctx.checkPermission('platform'); // 是否是平台用户权限
      const { generateSortParam } = ctx.helper.pagination;
      const { limit = 10, offset = 0, sort = '-created_at' } = await ctx.verify(
        indexRule,
        ctx.request.query
      );

      const query = {};
      [
        'order',
        'owner',
        'factory',
        'isActive',
        'isConsumerReceived',
        'isFactoryTracing',
      ].forEach(key => {
        const item = ctx.request.query[key];
        if (item) query[key] = item;
      });
      const tracings = await ctx.service.tracing.findMany(
        query,
        null,
        {
          limit: parseInt(limit),
          skip: parseInt(offset),
          sort: generateSortParam(sort),
        },
        'category pictures'
      );
      const count = await ctx.service.tracing.count(query);

      ctx.jsonBody = {
        data: tracings,
        meta: {
          limit,
          offset,
          sort,
          count,
        },
      };
    }

    /**
     * 获取溯源码详情
     *
     * @memberof CommodityController
     * @return {object} 溯源码详情
     */
    async show() {
      const { ctx, service, showRule } = this;
      const { key } = await ctx.verify(showRule, ctx.params);
      const query = {
        $or: [
          {
            inner_code: key,
          },
          {
            outer_code: key,
          },
        ],
      };
      const tracing = await service.tracing.findOne(
        query,
        'factory owner order products tracing_products'
      );
      if (tracing) {
        const { records } = tracing;
        for (let i = 0; i < records.length; i++) {
          const sender = await ctx.service.user.findById(records[i].sender);
          ctx.error(
            sender && sender.state === 'passed',
            18022,
            '溯源码发送者不存在'
          );
          records[i].sender = sender;
        }
      }
      ctx.error(tracing, 18002, '获取溯源码信息失败，该溯源码不存在');
      ctx.jsonBody = tracing;
    }

    /**
     * 通过订单创建溯源码
     *
     * @memberof CommodityController
     * @return {object} 指定订单生成的溯源码
     */
    async create() {
      const { ctx, service, createRule } = this;
      const basePath = path.join(__dirname, '../../files');
      ctx.checkPermission('platform'); // 是否是平台用户权限
      const { order } = await ctx.verify(createRule, ctx.request.body);

      // 配置excel
      const workBook = new excel.Workbook();
      const style = workBook.createStyle({
        font: {
          color: '#000000',
          size: 14,
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
      });
      const workSheet = workBook.addWorksheet('Sheet 1');

      // 验证订单是否存在
      const isOrderExist = await service.order.findById(order, 'commodity');
      ctx.error(isOrderExist, 18000, '生成溯源码失败，订单不存在');
      const { commodity, status, count, buyer } = isOrderExist;
      // 验证订单状态，非定制溯源码，验证是否付全款，定制溯源码验证是否已经付首付款
      ctx.error(
        status === 'PAYMENT_CONFIRMED',
        18001,
        '订单未确认支付，无法生成溯源码'
      );

      const targetTracings = [];
      const baseUrl = 'https://buildupstep.cn/page/tracing/code?';
      for (let i = 0; i < commodity.quata * count; i++) {
        // 密匙加密
        const privateHash = crypto.createHash('sha512');
        const publicHash = crypto.createHash('sha512');
        const UUID = uuid();
        const privateUUID = UUID + 1;
        const publicUUID = UUID + 2;
        privateHash.update(privateUUID);
        publicHash.update(publicUUID);
        const innerCode = `01${privateHash.digest('hex')}`;
        const outerCode = `01${publicHash.digest('hex')}`;
        const innerTracing = `${baseUrl}type=inner_code&id=${innerCode}`;
        const outerTracing = `${baseUrl}type=outer_code&id=${outerCode}`;
        const no = i + 1; // 对外编号
        // 数据写入excel[内码、外码、快递发货码]
        [innerTracing, outerTracing, outerCode].forEach((item, index) => {
          workSheet
            .cell(i + 1, index + 1)
            .string(item)
            .style(style);
        });

        targetTracings.push({
          factory: buyer,
          owner: buyer,
          order,
          no,
          private_uuid: privateUUID,
          public_uuid: publicUUID,
          inner_code: innerCode,
          outer_code: outerCode,
        });
      }
      /**
       * writeExcel
       *
       * @return {Promise} - write promise
       */
      const writeExcel = () => {
        return new Promise((resolve, reject) => {
          workBook.write(`${basePath}/${order}.xlsx`, err => {
            if (err) reject(err);
            resolve();
          });
        });
      };
      await writeExcel();

      // 将附件添加至文件系统中
      const fileStat = fs.statSync(`${basePath}/${order}.xlsx`);
      const file = await ctx.service.file.create({
        name: `${order}.xlsx`,
        type: 'application/vnd.ms-excel',
        path: `files/${order}.xlsx`,
        size: fileStat.size,
      });
      ctx.error(file, 17027, '订单附件创建失败');

      // 修改订单的状态，添加附件地址
      const { nModified } = await ctx.service.order.update(
        {
          _id: order,
        },
        {
          status: 'PRINTED',
          attachment: file._id,
          print_at: new Date(),
        }
      );
      ctx.error(nModified === 1, 17026, '溯源码打印失败');
      const tracings = await service.tracing.insertMany(targetTracings);
      ctx.error(tracings, 17028, '生成内外码失败');
      ctx.jsonBody = null;
    }

    /**
     * 修改溯源码
     *
     * @memberof CommodityController
     * @return {promise} 被修改溯源码
     */
    async update() {
      const { ctx, service, updateRule } = this;
      const {
        key,
        record,
        products,
        tracing_products,
        operation,
        isFactoryTracing,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );
      const { role_type, user_id } = ctx.registerPermission();
      ctx.error(key, 18004, '溯源密匙为必填项', 400);
      const isTracingExist = await service.tracing.findOne({
        $or: [
          {
            inner_code: key,
          },
          {
            outer_code: key,
          },
        ],
      });
      ctx.error(
        !isTracingExist.isEnd,
        18005,
        '溯源码已被签收，不能再进行任何修改操作'
      );
      const targetData = {
        isActive: true,
      };

      // 绑定溯源码商品
      if (operation === 'bind') {
        ctx.error(role_type === 'factory', 18018, '非厂家类型，不能绑定商品'); // 验证当前用户类型是否为厂家
        ctx.error(
          user_id === isTracingExist.factory,
          18019,
          '非自己的溯源码不能进行绑定商品操作'
        ); // 验证溯源码是否是自己的
        ctx.error(
          isTracingExist.state === 'UNBIND',
          18016,
          '当前状态不能绑定商品信息'
        ); // 是自己的，则验证溯源码当前状态能否绑定商品
        ctx.error(
          (products && products.length > 0) ||
            (tracing_products && tracing_products.length > 0),
          18015,
          '绑定商品为必填'
        ); // 当前状态能绑定商品，则验证上传的商品信息是否正确
        if (isFactoryTracing) {
          const tracing_count = tracing_products.length;
          ctx.error(
            tracing_count,
            18006,
            '溯源码绑定溯源商品失败，溯源商品列表为空'
          );
          targetData.isFactoryTracing = isFactoryTracing;
          // 验证tracing_products包含的tracing都存在
          const tracingProductsCount = await ctx.service.tracing.count({
            _id: {
              $in: tracing_products,
            },
          });
          ctx.error(
            tracing_count === tracingProductsCount,
            18007,
            '溯源码列表中存在错误的码'
          );
          targetData.tracing_products = tracing_products;
        } else if (products && products.length) {
          const productsCount = await ctx.service.barcode.count({
            _id: {
              $in: products,
            },
          });
          ctx.error(
            productsCount === products.length,
            18007,
            '条形码列表中存在错误的码'
          );
          // 绑定普通商品
          targetData.products = products;
          targetData.state = 'BIND';
        }
      } else {
        const { records: currentRecords } = isTracingExist;
        const latestRecord = currentRecords.pop();
        // 设置溯源记录
        const {
          express_no,
          express_name,
          reciver,
          reciver_type,
          reciver_name,
          reciver_phone,
          reciver_address,
        } = record || {};
        if (operation === 'send') {
          ctx.error(!_.isEmpty(record), 18011, '溯源记录为必填项', 400);
          // 已绑定商品信息，则进入溯源流程
          ctx.error(
            ['business', 'consumer'].includes(reciver_type),
            18019,
            'reciver_type必须为business或consumer'
          ); // 验证当前用户类型是否具有发货权限-厂家或经销商
          ctx.error(
            isTracingExist.owner._id.toString() === user_id,
            18020,
            '发货失败，非溯源码拥有者不能进行发货操作'
          ); // 验证当前用户是否为溯源码的拥有者
          ctx.error(
            isTracingExist.state === 'BIND',
            18012,
            '当前状态不能进行发货操作'
          ); // 验证溯源码状态能否进行发货操作
          if (reciver_type === 'business') {
            const isReciverExist = await ctx.service.user.findById(reciver);
            ctx.error(isReciverExist, 18009, '溯源记录包含的收货人不存在');
            currentRecords.push({
              sender: user_id,
              send_at: new Date(),
              reciver_type,
              reciver,
            });
          } else {
            ctx.error(
              reciver_name && reciver_phone && reciver_address,
              18010,
              '溯源记录包含的收货人信息缺失'
            );
            currentRecords.push({
              sender: user_id,
              send_at: new Date(),
              reciver_type,
              reciver_name,
              reciver_phone,
              reciver_address,
            });
          }
          targetData.state = 'SEND';
          targetData.records = currentRecords;
        } else if (operation === 'express') {
          ctx.error(!_.isEmpty(record), 18011, '溯源记录为必填项', 400);
          // 暂时不涉及快递员及快递信息
          ctx.error(
            role_type === 'courier',
            18017,
            '非快递员类型不能绑定快递信息'
          ); // 验证当前用户类型是否具有发货权限
          ctx.error(
            isTracingExist.state === 'SEND',
            18012,
            '当前状态不能进行绑定快递信息操作'
          ); // 验证溯源码状态能否进行发货操作
          ctx.error(
            express_no && express_name,
            18010,
            '溯源记录包含的快递信息缺失'
          );
          Object.assign(latestRecord, {
            courier: user_id,
            express_no,
            express_name,
            express_at: new Date(),
          }); // 修改溯源记录
          currentRecords.push(latestRecord); // 替换最后一条溯源记录
          targetData.records = currentRecords;
          targetData.state = 'EXPRESSED';
        } else if (operation === 'receive') {
          // 验货,receiver_type为business时，验货时必须为其自己。若type为consumer则不进行校验
          ctx.error(
            isTracingExist.state === 'SEND',
            18014,
            '验货失败，该溯源记录未到达验货阶段'
          ); // 验证当前状态能否进行收货操作
          const { reciver_type, reciver } = latestRecord;
          const owner = user_id;
          latestRecord.reciver_at = new Date(); // 统一添加收货时间
          if (reciver_type === 'business') {
            ctx.error(
              reciver._id.toString() === user_id,
              18021,
              '非收货人无权进行收货操作'
            );
          } else targetData.isEnd = true;
          currentRecords.push(latestRecord); // 替换最后一条溯源记录
          targetData.records = currentRecords;
          targetData.owner = owner;
          targetData.state = 'RECEIVED';
        }
      }
      // 溯源码更新
      Object.assign(isTracingExist, targetData);
      const { nModified } = await ctx.service.tracing.update(
        {
          $or: [
            {
              inner_code: key,
            },
            {
              outer_code: key,
            },
          ],
        },
        targetData
      );
      ctx.error(nModified === 1, 18006, '溯源码修改失败');

      ctx.jsonBody = isTracingExist;
    }

    /**
     * 删除溯源码
     *
     * @memberof CommodityController
     * @return {array} 删除的溯源码
     */
    async destroy() {
      const { ctx, service, destroyRule } = this;
      const { id } = await ctx.verify(destroyRule, ctx.params);

      // 查询并删除溯源码
      const tracing = await service.tracing.findById(id);
      ctx.error(tracing, '溯源码不存在', 18002);
      const { nModified } = await service.tracing.destroy({
        _id: id,
      });
      ctx.error(nModified === 1, 18003, '溯源码删除失败');
      ctx.jsonBody = tracing;
    }
  }

  return TracingController;
};
