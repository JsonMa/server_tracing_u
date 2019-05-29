'use strict';
const Service = require('../lib/DBService');

/**
 * CounterfeitService
 *
 * @class CounterfeitService
 * @extends {Service}
 */
class CounterfeitService extends Service {
  /**
   *Creates an instance of OrderService.
   * @param {Object} ctx - context
   * @memberof CounterfeitService
   */
  constructor(ctx) {
    super(ctx, 'Counterfeit');
  }
}

module.exports = CounterfeitService;
