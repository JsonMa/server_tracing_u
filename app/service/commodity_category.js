'use strict';
const Service = require('../lib/DBService');

/**
 * User Service
 *
 * @class UserService
 * @extends {Service}
 */
class CommodityCategoryService extends Service {

  /**
   *Creates an instance of UserService.
   * @param {Object} ctx - context
   * @memberof CommodityCategoryService
   */
  constructor(ctx) {
    super(ctx, 'CommodityCategory');
  }
}

module.exports = CommodityCategoryService;
