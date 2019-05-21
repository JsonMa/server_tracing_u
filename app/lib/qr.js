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
    this.params = Object.assign(
      {
        baseUrl: '',
        qrType: 'png'
      },
      params
    );
  }

  /**
   * 创建Qr
   *
   * @param {String} key - key
   * @memberof Qr
   * @return {undefined}
   */
  create(key) {
    const { baseUrl, qrType } = this.params;
    return qr.image(`${baseUrl}/${key}`, {
      type: qrType
    });
  }
}

module.exports = Qr;
