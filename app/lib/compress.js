'use strict';
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
/**
 *
 *
 * @class Compress
 */
class Compress {
  /**
   *Creates an instance of Compress.
   * @param {String} order - params
   * @memberof Compress
   */
  constructor(order) {
    this.order = order;
    this.basePath = path.join(__dirname, '../../files');
  }

  /**
   * create compress file
   *
   * @param {Object} options  - compress options
   * @memberof Compress
   * @return {undefined}
   */
  createCompressFile(options) {
    const writeStream = fs.createWriteStream(`${this.basePath}/${this.order}.zip`);
    const archive = archiver('zip', {
      zlib: {
        level: 9,
      },
    });

    return new Promise((resolve, reject) => {
      // 错误处理
      archive.on('warning', function(err) {
        reject(err);
      });

      archive.on('error', function(err) {
        reject(err);
      });
    });
  }
}

module.exports = Compress;
