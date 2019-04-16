// @ts-nocheck
const _ = require('lodash');
const assert = require('assert');
const crypto = require('crypto');
const Promise = require('bluebird');

/**
 *
 * 初始化model, 并注入其依赖项
 *
 * @class Initiater
 */
module.exports = class Initiater {
  /**
   * Creates an instance of Initiater.
   * @memberof Initiater
   *
   * @param {App} app - Egg Application
   */
  constructor(app) {
    this.app = app;
    this.values = {};
    this.adminId = '1';
  }

  /**
   * 删除injected的models
   *
   * @returns {Promise} 任务
   */
  destory() {
    const values = _.assign(this.values);
    this.values = {};
    return Promise.all(Object.keys(values)
      .map(key => this.app.model[_.upperFirst(_.camelCase(key))]
        .destroy({
          where: {
            id: {
              $in: values[key].map(item => item.id),
            },
          },
          force: true,
        })));
  }

  /**
   * 注入models
   *
   * @param {any} [models=['order', 'address', 'commodity', 'commodity_category', 'post',
   * 'post_category', 'post_comment', 'post_hits', 'post_vote', 'sensitive_word', 'file']]
   * - 需要初始化的model
   * @memberof Initiater
   * @returns {Promise} 注入model的Map, Promise<Map>
   */
  inject(models) {
    return this._injectDependences(['user', ...models]);
  }

  /**
   *
   *
   * @param {any} [models=['order', 'address', 'commodity', 'commodity_category', 'post',
   * 'post_category', 'post_comment', 'post_hits', 'post_vote', 'sensitive_word', 'file']]
   * - 需要初始化的model
   * @memberof Initiater
   * @returns {Promise} 注入model的Map, Promise<Map>
   */
  _injectDependences(models = []) {
    return Promise.mapSeries(models, async (key) => {
      if (this.values[key]) return;
      const value = await this[`_inject${_.upperFirst(_.camelCase(key))}`]();
      assert(_.isArray(value), 'value must be format of array!');
      this.values[key] = value;
    });
  }

  /**
   *
   *
   * @param {any} model       - 需要获取的model
   * @param {any} [limit={}]  - 需要匹配的条件，key-value
   * @returns {Promise} 匹配的model
   * @memberof Initiater
   */
  _getRandomItem(model, limit = {}) {
    const target = this.values[model];
    assert(target, `dependences '${model}' are required !`);

    if (_.isArray(target)) {
      const arr = target.slice();
      if (!limit) {
        return _.sample(arr);
      }
      while (arr) {
        const item = arr.pop();
        if (_.isMatch(item, limit)) {
          return item;
        }
      }
      assert(false, `can not find injected model of ${model}`);
    }

    return assert(false, 'unsupport type of model!');
  }

  /**
   * 注入user
   *
   * @returns {Promise} 已注入的users, Promise<Array<User>>
   * @memberof Initiater
   */
  _injectUser() {
    const md5 = crypto.createHash('md5');
    const password = md5.update('123456', 'utf-8').digest('hex');
    return this.app.model.User.bulkCreate([{
      name: 'huayan-test-user',
      phone: '13896120331',
      password,
    }]);
  }

  /**
   * 注入commodity及其依赖model
   *
   * @returns {Promise} 已注入的commodities, Promise<Array<Commodity>>
   * @memberof Initiater
   */
  _injectCommodity() {
    return this._injectDependences(['commodity_category']).then(() =>
      // inject commodities ...
      this.app.model.Commodity.bulkCreate([{
        name: '二维码',
        price: 1,
        act_price: 0.6,
        sales: 0,
        recommended: true,
        status: 'ON',
        category_id: this._getRandomItem('commodity_category').id,
      },
      {
        name: '二维码纸张',
        price: 1000,
        act_price: 1000,
        sales: 0,
        recommended: true,
        status: 'OFF',
        category_id: this._getRandomItem('commodity_category').id,
      },
      {
        name: '二维码打印机',
        price: 1000,
        act_price: 1000,
        sales: 0,
        recommended: true,
        status: 'OFF',
        category_id: this._getRandomItem('commodity_category').id,
      },
      {
        name: '打印机电池',
        price: 1000,
        act_price: 1000,
        sales: 0,
        recommended: true,
        status: 'OFF',
        category_id: this._getRandomItem('commodity_category').id,
      },
      {
        name: '打印机电源适配器',
        price: 1000,
        act_price: 1000,
        sales: 0,
        recommended: true,
        status: 'OFF',
        category_id: this._getRandomItem('commodity_category').id,
      },
      ]));
  }

  /**
   * 注入commodity_category及其依赖model
   *
   * @returns {Promise} 已注入的commodity_categories, Promise<Array<CommodityCategory>>
   * @memberof Initiater
   */
  _injectCommodityCategory() {
    return this._injectDependences(['file']).then(() =>
      // inject commodity_category ...
      this.app.model.CommodityCategory.bulkCreate([{
        name: '二维码',
        cover_id: this._getRandomItem('file').id,
      },
      {
        name: '配件',
        cover_id: this._getRandomItem('file').id,
      },
      ]));
  }

  /**
   * 注入files及其依赖model
   *
   * @returns {Promise} 已注入的files, Promise<Array<File>>
   * @memberof Initiater
   */
  _injectFile() {
    // inject files ...
    return this.app.model.File.bulkCreate([{
      name: 'file1',
      path: 'file://mock-file1',
      type: 'image/png',
      size: 1024,
    },
    {
      name: 'file2',
      path: 'file://mock-file2',
      type: 'video/mp4',
      size: 1024,
    },
    ]);
  }

  /**
   * 注入commodity attribute及其依赖model
   *
   * @returns {Promise} 已注入的commodity attribute, Promise<Array<CommodityAttribute>>
   * @memberof Initiater
   */
  _injectCommodityAttr() {
    return this._injectDependences(['commodity'])
      .then(() => {
        const commodity = this._getRandomItem('commodity');
        // inject commodity ...
        return this.app.model.CommodityAttr.bulkCreate([{
          commodity_id: commodity.id,
          name: 'MOCK-ATTRIBUTE',
          values: ['MOCK-ATTRIBUTE-VALUE', 'MOCK-ATTRIBUTE-VALUE2'],
        },
        {
          commodity_id: commodity.id,
          name: 'MOCK-ATTRIBUTE2',
          values: ['MOCK-ATTRIBUTE-VALUE', 'MOCK-ATTRIBUTE-VALUE2'],
        },
        ]);
      });
  }
  /**
   * 注入banner及其依赖model
   *
   * @returns {Promise} 已注入的banner, Promise<Array<Banner>>
   * @memberof Initiater
   */
  _injectBanner() {
    return this._injectDependences(['file']).then(() =>
    // inject file ...
      this.app.model.Banner.bulkCreate([{
        cover_id: this.values.file[0].id,
        video_url: 'http://1255680877.vod2.myqcloud.com/cceb63d0vodgzp1255680877/1eee082d4564972819039364800/2Xya3DCOAPcA.mp4',
      },
      {
        cover_id: this.values.file[0].id,
        video_url: 'http://1255680877.vod2.myqcloud.com/cceb63d0vodgzp1255680877/1eee082d4564972819039364800/2Xya3DCOAPcA.mp4',
      },
      ]));
  }
};
