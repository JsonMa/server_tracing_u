'use strict';

const VError = require('verror');
const {
  Service,
} = require('egg');

/**
 * db base service
 *
 * @class DBService
 * @extends {Service}
 */
class DBService extends Service {
  /**
   *Creates an instance of DBService.
   * @param {Object} ctx   - context
   * @param {String} type  - 类型
   * @memberof DBService
   */
  constructor(ctx, type) {
    super(ctx);
    this.type = type;
  }

  /**
   * find one
   *
   * @param {Object} conditions - 条件
   * @return {Object} 查询结果
   * @memberof DBService
   */
  async findOne(conditions) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const query = Object.assign({
      deleted_at: null,
    }, conditions);
    const date = await this.ctx.model[this.type].findOne(query).catch(error => {
      throw new VError({
        name: EMONGODB,
        cause: error,
        info: {
          query,
        },
      },
      '[%s] 查询失败 ',
      this.type
      );
    });
    return date;
  }

  /**
   * find many
   *
   * @param {Object} conditions      - 条件
   * @param {Array} [fields=null]    - 字段
   * @param {Object} [options=null]  - options
   * @return {Array} results
   * @memberof DBService
   */
  async findMany(conditions, fields = null, options = null) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const query = Object.assign({
      deleted_at: null,
    }, conditions);
    const items = await this.ctx.model[this.type]
      .find(query, fields, options)
      .catch(error => {
        throw new VError({
          name: EMONGODB,
          cause: error,
          info: {
            query,
          },
        },
        '[%s] 查询失败 ',
        this.type
        );
      });
    return items;
  }

  /**
   * find all
   *
   * @param {Object}  conditions - 条件
   * @return {Array}  results
   * @memberof DBService
   */
  async findAll(conditions) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const query = Object.assign({}, conditions);
    const date = await this.ctx.model[this.type].findOne(query).catch(error => {
      throw new VError({
        name: EMONGODB,
        cause: error,
        info: {
          query,
        },
      },
      '[%s] 查询失败 ',
      this.type
      );
    });
    return date;
  }

  /**
   * count
   *
   * @param {Object} options  - 条件
   * @return {Number} result
   * @memberof DBService
   */
  async count(options) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const op = Object.assign({
      deleted_at: null,
    }, options);
    const count = await this.ctx.model[this.type]
      .find(op)
      .count()
      .catch(error => {
        throw new VError({
          name: EMONGODB,
          cause: error,
          info: {
            op,
          },
        },
        '[%s] 查询失败 ',
        this.type
        );
      });
    return count;
  }

  /**
   * create
   *
   * @param {Object} data - insert data
   * @return {Object} result
   * @memberof DBService
   */
  async create(data) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const item = await this.ctx.model[this.type].create(data).catch(error => {
      throw new VError({
        name: EMONGODB,
        cause: error,
        info: data,
      },
      `[${this.type}] 创建失败`
      );
    });
    return item;
  }

  /**
   * insert many
   *
   * @param {Array} data - array data
   * @return {Array} results
   * @memberof DBService
   */
  async insertMany(data) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const item = await this.ctx.model[this.type]
      .insertMany(data)
      .catch(error => {
        throw new VError({
          name: EMONGODB,
          cause: error,
          info: data,
        },
        `[${this.type}] 创建失败`
        );
      });
    return item;
  }

  /**
   * update
   *
   * @param {Object} options            - option
   * @param {Object} values             - value
   * @param {boolean} [multiple=false]  - 是否多个
   * @param {boolean} [upsert=false]    - 是否更新插入
   * @return {Object} result
   * @memberof DBService
   */
  async update(options, values, multiple = false, upsert = false) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    const items = await this.ctx.model[this.type][multiple ? 'updateOne' : 'updateMany'](options, {
      $set: values,
    }, {
      upsert,
    })
      .catch(error => {
        throw new VError({
          name: EMONGODB,
          cause: error,
          info: options,
        },
        `[${this.type}] 更新失败`
        );
      });
    return items;
  }

  /**
   * destroy
   *
   * @param {Object} options              - options
   * @param {boolean} [multiple=false]    - 是否多个
   * @param {boolean} [force=false]       - 是否强制
   * @return {Object} result
   * @memberof DBService
   */
  async destroy(options, multiple = false, force = false) {
    const {
      EMONGODB,
    } = this.ctx.errors;
    let ret;
    if (force) {
      ret = await this.ctx.model[this.type][multiple ? 'deleteOne' : 'deleteMany'](options)
        .catch(error => {
          throw new VError({
            name: EMONGODB,
            cause: error,
            info: options,
          },
          `[${this.type}] 删除失败`
          );
        });
    } else {
      ret = await this.ctx.model[this.type]
        .update(
          options, {
            deleted_at: new Date(),
          }, {
            multiple: true,
          }
        )
        .catch(error => {
          throw new VError({
            name: EMONGODB,
            cause: error,
            info: options,
          },
          `[${this.type}] 删除失败`
          );
        });
    }
    return ret;
  }
}
module.exports = DBService;
