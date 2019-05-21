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
   * create dir
   *
   * @param {String} name - dir name
   * @memberof Compress
   * @return {undefined}
   */
  createDir(name) {
    fs.mkdirSync(`${this.basePath}/${name}`);
  }

  /**
   * create file
   *
   * @param {String} name - file name
   * @param {String} path - file path
   * @memberof Compress
   * @return {undefined}
   */
  createFile(name, path) {
    const qrType = 'png';
    const baseUrl = '';
    const qrcode = new qr({
      baseUrl,
      qrType
    });
    const writeStream = fs.createWriteStream(`${path}/${name}.${qrType}`);
    qrcode.createFile(name).pipe(writeStream);
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
        level: 9
      }
    });

    return new Promise((resolve, reject) => {
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          // throw error
          throw err;
        }
      });

      // good practice to catch this error explicitly
      archive.on('error', function(err) {
        throw err;
      });
    });
  }
}

module.exports = Compress;
