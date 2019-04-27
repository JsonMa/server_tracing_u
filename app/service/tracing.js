'use strict';
const Service = require('../lib/DBService');

/**
 * Tracing Service
 *
 * @class TracingService
 * @extends {Service}
 */
class TracingService extends Service {
  /**
   *Creates an instance of TracingService.
   * @param {Object} ctx - context
   * @memberof TracingService
   */
  constructor(ctx) {
    super(ctx, 'Tracing');
  }
}

module.exports = TracingService;
