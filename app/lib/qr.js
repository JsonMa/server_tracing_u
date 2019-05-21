'use strict';
const qr = require('qr-image');
/**
 * Qr class
 *
 * @class Qr
 */
class Qr {
  /**
   *Creates an instance of Qr.
   * @param {Object} params - params
   * @memberof Qr
   */
  constructor(params) {
    this.baseUrl = params.baseUrl;
    this.qrType = params.qrType;
  }

  /**
   * 创建Qr
   *
   * @param {String} key - key
   * @memberof Qr
   * @return {undefined}
   */
  create(key) {
    const {
      baseUrl,
      qrType,
    } = this;
    return qr.image(`${baseUrl}/${key}`, {
      type: qrType,
    });
  }
}

module.exports = Qr;
