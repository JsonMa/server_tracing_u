'use strict';
const Service = require('../lib/DBService');
const compress = require('../lib/compress');
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

  /**
   * 压缩
   *
   * @memberof TracingService
   */
  compress() {}
}

module.exports = TracingService;
