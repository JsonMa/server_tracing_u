const { Service } = require('egg')
const VError = require('verror')
const DataLoader = require('dataloader')

class DBService extends Service {
  constructor (ctx, type) {
    super(ctx)
    const { EAPPLICATION } = this.app.errors

    ctx.assert(
      ctx.model[type],
      new VError(
        {
          name: EAPPLICATION,
          info: { type }
        },
        ctx.__('instantiation_service_failed', type)
      )
    )
    this.type = type
  }

  get loader () {
    if (this._loader) return this._loader

    this._loader = new DataLoader(keys => this.findMany({ _id: { $in: keys } }))
    return this._loader
  }

  async findByIds (ids) {
    let _ids = ids.filter(id => id) // 去掉undefined
    _ids = Array.from(new Set(_ids.map(id => id.toString()))) // id去重

    const { EAPPLICATION } = this.app.errors
    try {
      return await this.loader.loadMany(_ids)
    } catch (e) {
      throw new VError(
        {
          name: EAPPLICATION,
          case: e,
          info: { ids: _ids }
        },
        this.ctx.__('not_all_data')
      )
    }
  }

  async findById (id) {
    const { EAPPLICATION } = this.app.errors
    try {
      return await this.loader.load(id)
    } catch (e) {
      throw new VError(
        {
          name: EAPPLICATION,
          case: e,
          info: { id }
        },
        this.ctx.__('not_exist_data')
      )
    }
  }

  async findOne (conditions, fields = null, options = { paranoid: true }) {
    const { EMONGODB } = this.app.errors
    if (Object.keys(options).indexOf('paranoid') === -1) options.paranoid = true
    const query = options.paranoid
      ? Object.assign({ deleted_at: null }, conditions)
      : conditions
    const date = await this.app.model[this.type].findOne(query, fields).catch(error => {
      throw new VError(
        {
          name: EMONGODB,
          cause: error,
          info: { query }
        },
        this.ctx.__('the_query_fails', this.type)
      )
    })
    return date
  }

  async findMany (conditions, fields = null, options = { paranoid: true }) {
    const { EMONGODB } = this.app.errors
    if (Object.keys(options).indexOf('paranoid') === -1) options.paranoid = true
    const query = options.paranoid
      ? Object.assign({ deleted_at: null }, conditions)
      : conditions
    const items = await this.app.model[this.type]
      .find(query, fields, options)
      .catch(error => {
        throw new VError(
          {
            name: EMONGODB,
            cause: error,
            info: { query }
          },
          this.ctx.__('the_query_fails', this.type)
        )
      })
    return items
  }

  async count (conditions, options = { paranoid: true }) {
    const { EMONGODB } = this.app.errors
    if (Object.keys(options).indexOf('paranoid') === -1) options.paranoid = true
    const query = options.paranoid
      ? Object.assign({ deleted_at: null }, conditions)
      : conditions
    const count = await this.app.model[this.type]
      .find(query)
      .count()
      .catch(error => {
        throw new VError(
          {
            name: EMONGODB,
            cause: error,
            info: { query }
          },
          this.ctx.__('the_query_fails', this.type)
        )
      })
    return count
  }

  async create (data) {
    const { EMONGODB } = this.app.errors
    const item = await this.ctx.model[this.type].create(Object.assign({created_at: new Date()}, data)).catch(error => {
      throw new VError(
        {
          name: EMONGODB,
          cause: error,
          info: data
        },
        this.ctx.__('create_failed', this.type)
      )
    })
    return item
  }

  async insertMany (data) {
    const { EMONGODB } = this.app.errors
    const item = await this.ctx.model[this.type]
      .insertMany(data)
      .catch(error => {
        throw new VError(
          {
            name: EMONGODB,
            cause: error,
            info: data
          },
          this.ctx.__('create_failed', this.type)
        )
      })
    return item
  }

  async update (queries, values, options, multiple = false) {
    const { EMONGODB } = this.app.errors
    const vals = Object.assign({ updated_at: new Date() }, values)
    const items = await this.ctx.model[this.type][multiple ? 'updateOne' : 'updateMany'](queries, { $set: vals }, options)
      .catch(error => {
        throw new VError(
          {
            name: EMONGODB,
            cause: error,
            info: options
          },
          this.ctx.__('delete_failed', this.type)
        )
      })

    return items
  }

  async destroy (options, multiple = false, force = false) {
    const { EMONGODB } = this.app.errors
    let ret
    if (force) {
      ret = await this.ctx.model[this.type][multiple ? 'deleteOne' : 'deleteMany'](options)
        .catch(error => {
          throw new VError(
            {
              name: EMONGODB,
              cause: error,
              info: options
            },
            this.ctx.__('delete_failed', this.type)
          )
        })
    } else {
      ret = await this.ctx.model[this.type]
        .update(
          options,
          {
            deleted_at: new Date()
          },
          {
            multi: true
          }
        )
        .catch(error => {
          throw new VError(
            {
              name: EMONGODB,
              cause: error,
              info: options
            },
            this.ctx.__('delete_failed', this.type)
          )
        })
    }
    return ret
  }
}

module.exports = DBService
