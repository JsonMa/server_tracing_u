'use strict';
const Service = require('../lib/DBService');

/**
 * Barcode Service
 *
 * @class BarcodeService
 * @extends {Service}
 */
class BarcodeService extends Service {
  /**
   *Creates an instance of BarcodeService.
   * @param {Object} ctx - context
   * @memberof BarcodeService
   */
  constructor(ctx) {
    super(ctx, 'Barcode');
  }
}

module.exports = BarcodeService;
