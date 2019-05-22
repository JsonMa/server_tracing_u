'use strict';
const fs = require('fs');
const archiver = require('archiver');
const qr = require('./qr');
const path = require('path');
/**
 *
 *
 * @class Compress
 */
class Compress {
  /**
   *Creates an instance of Compress.
   * @param {Object} params - params
   * @memberof Compress
   */
  constructor(params) {
    this.parmas = params;
    this.basePath = path.join(__dirname, '../../files');
  }

  /**
   * create compress file
   *
   * @param {String} name     - compress file name
   * @param {Object} options  - compress options
   * @memberof Compress
   * @return {undefined}
   */
  createCompressFile(name, options) {
    const writeStream = fs.createWriteStream(`${this.basePath}/${name}.zip`);
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
