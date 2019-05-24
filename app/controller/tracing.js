'use strict';
const uuid = require('uuid/v4');
const Qr = require('../lib/qr');
const compressing = require('compressing');
const path = require('path');
const fs = require('fs');
// const eliminate = require('eliminate');

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
          id: {
            $ref: 'schema.definition#/oid',
          },
          public_key: {
            type: 'string',
          },
          private_key: {
            type: 'string',
          },
        },
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
          private_key: {
            type: 'string',
          },
          public_key: {
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
                $ref: 'schema.definition#/name',
              },
              reciver_address: {
                type: 'string',
              },
              sender: {
                $ref: 'schema.definition#/oid',
              },
            },
            required: ['id'],
            $async: true,
            additionalProperties: false,
          },
          products: {
            type: 'array',
            items: {
              properties: {
                name: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                manufacturer: {
                  type: 'string',
                },
                attributes: {
                  type: 'array',
                  items: {
                    properties: {
                      name: {
                        type: 'string',
                      },
                      value: {
                        type: 'string',
                      },
                    },
                    required: ['name', 'value'],
                    $async: true,
                    additionalProperties: false,
                  },
                },
              },
              required: ['name', 'description', 'manufacturer', 'attributes'],
              $async: true,
              additionalProperties: false,
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
      ctx.loginPermission(); // 是否已登录
      const { id, public_key, private_key } = await ctx.verify(
        showRule,
        ctx.params
      );

      const tracing = await service.tracing.findById(
        id || public_key || private_key,
        'owner order'
      );
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

      // 验证订单是否存在
      const isOrderExist = await service.order.findById(order, 'commodity');
      ctx.error(isOrderExist, 18000, '生成溯源码失败，订单不存在');
      const { commodity, isStagePay, status, count, buyer } = isOrderExist;
      // 验证订单状态，非定制溯源码，验证是否付全款，定制溯源码验证是否已经付首付款
      if (isStagePay) {
        ctx.error(
          status === 'FIRST_PAYED',
          18001,
          '订单未支付，无法生成溯源码'
        );
      } else {
        ctx.error(status === 'ALL_PAYED', 18001, '订单未支付，无法生成溯源码');
      }

      // 创建溯源码
      const qrInstance = new Qr({
        order,
      });
      const targetTracings = [];
      for (let i = 0; i < commodity.quata * count; i++) {
        const privateKey = uuid();
        const publicKey = uuid();
        const no = i + 1; // 对外编号
        targetTracings.push({
          factory: buyer,
          owner: buyer,
          order,
          no,
          private_key: privateKey,
          public_key: publicKey,
        });
        // 为溯源码生成溯源二维码并存入文件夹
        qrInstance.createFiles(no, publicKey, privateKey);
      }

      await compressing.tar.compressDir(
        `${basePath}/${order}`,
        `${basePath}/${order}.tar`
      ); // 创建压缩文件
      // await eliminate(`${basePath}/${order}`); // 删除文件夹
      // 将附件添加至文件系统中
      const fileStat = fs.statSync(`${basePath}/${order}.tar`);
      const file = await ctx.service.file.create({
        name: `${order}.tar`,
        type: 'application/x-tar',
        path: `files/${order}.tar`,
        size: fileStat.size,
      });
      ctx.error(file, 17027, '订单附件创建失败');

      // 修改订单的状态，添加附件地址
      const { nModified } = await ctx.service.order.update(
        {
          _id: order,
        },
        {
          status,
          attachment: file._id,
          print_at: new Date(),
        }
      );
      ctx.error(nModified === 1, 17026, '溯源码打印失败');
      const tracings = await service.tracing.insertMany(targetTracings);

      ctx.jsonBody = tracings;
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
        private_key,
        public_key,
        record,
        products,
        tracing_products,
        operation,
        isFactoryTracing,
      } = await ctx.verify(
        updateRule,
        Object.assign(ctx.request.body, ctx.params)
      );

      ctx.error(public_key || private_key, 18004, '溯源密匙为必填项', 400);
      const isTracingExist = await service.tracing.findById(
        private_key || public_key
      );
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
          // 绑定普通商品
          targetData.products = products;
        }
      } else {
        ctx.error(record, 18011, '溯源记录为必填项', 400);
        const { records: currentRecords } = isTracingExist;
        const recordCount = currentRecords.length;
        const latestRecord = currentRecords.unshift();
        // 设置溯源记录
        const {
          courier,
          sender,
          express_no,
          express_name,
          reciver,
          reciver_type,
          reciver_name,
          reciver_phone,
          reciver_address,
        } = record;
        if (operation === 'send') {
          // 经销商或厂家发货
          ctx.error(
            isTracingExist.isReceived,
            18012,
            '上次溯源记录未处于完结状态，不能新增发货记录'
          );
          const isSenderExist = await ctx.service.user.findById(sender);
          ctx.error(isSenderExist, 18009, '溯源记录包含的发货人不存在');
          if (reciver_type === 'business') {
            const isReciverExist = await ctx.service.user.findById(reciver);
            ctx.error(isReciverExist, 18009, '溯源记录包含的收货人不存在');
          } else {
            ctx.error(
              reciver_name && reciver_phone && reciver_address,
              18010,
              '溯源记录包含的收货人信息缺失'
            );
          }
          currentRecords.push({
            sender,
            send_at: new Date(),
            reciver,
          });
          targetData.records = currentRecords;
        } else if (operation === 'express') {
          // 绑定快递信息
          ctx.error(
            !latestRecord.courier,
            18013,
            '溯源记录已存在快递信息，不能重复添加'
          );
          const isCourierExist = await ctx.service.user.findById(courier);
          ctx.error(isCourierExist, 18008, '溯源记录包含的快递员不存在');
          ctx.error(
            express_no && express_name,
            18010,
            '溯源记录包含的快递信息缺失'
          );
          // 默认修改最后一条溯源记录
          Object.assign(latestRecord, {
            courier,
            express_no,
            express_name,
          });
          currentRecords.splice(recordCount - 1, 1, latestRecord);
          targetData.records = currentRecords;
        } else if (operation === 'receive') {
          // 验货
          const { reciver_type, sender, express_no, reciver } = latestRecord;
          ctx.error(
            express_no && reciver && sender,
            18014,
            '验货失败，该溯源记录未到达验货阶段'
          );
          if (reciver_type === 'consumer') {
            // 修改owner为receive
            Object.assign(targetData, {
              owner: reciver,
              isEnd: true,
              isReceived: true,
            });
          }
        }
      }
      // 溯源码更新
      Object.assign(isTracingExist, targetData);
      const { nModified } = await ctx.service.tracing.update(
        {
          ...(private_key
            ? {
              private_key,
            }
            : {}),
          ...(public_key
            ? {
              public_key,
            }
            : {}),
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
