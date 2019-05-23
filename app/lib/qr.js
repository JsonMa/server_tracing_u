'use strict';
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

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
    this.params = Object.assign({
      baseUrl: 'http://www.baidu.com',
      qrType: 'png',
    },
    params
    );
    this.basePath = path.join(__dirname, '../../files');
    this.createOrderDir(); // 创建order dir
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
    } = this.params;
    return qr.imageSync(`${baseUrl}/${key}`, {
      type: qrType,
      margin: 1,
      size: 10,
    });
  }

  /**
   * create dir
   *
   * @memberof Compress
   * @return {undefined}
   */
  createOrderDir() {
    try {
      const dirStat = fs.statSync(`${this.basePath}/${this.params.order}`);
      assert(dirStat.isDirectory(), `目录名：${this.params.order}在files下不存在`);
      return;
    } catch (error) {
      return fs.mkdirSync(`${this.basePath}/${this.params.order}`);
    }
  }

  /**
   * create qr dir
   *
   * @param {String} no - 溯源码编号
   * @memberof Qr
   * @return {undefined}
   */
  createQrDir(no) {
    try {
      const dirStat = fs.statSync(
        `${this.basePath}/${this.params.order}/${no}`
      );
      assert(dirStat.isDirectory(), `目录名：${no}在files下不存在`); // 为true的话那么存在，如果为false不存在
      return;
    } catch (error) {
      return fs.mkdirSync(`${this.basePath}/${this.params.order}/${no}`);
    }
  }

  /**
   * create file
   *
   * @param {String} no           - 溯源码编号
   * @param {String} publicKey    - 溯源码公匙
   * @param {String} privateKey   - 溯源码私匙
   * @memberof Compress
   * @return {undefined}
   */
  createFiles(no, publicKey, privateKey) {
    this.createQrDir(no);
    ['public', 'private'].forEach(fileName => {
      const key = fileName === 'public' ? publicKey : privateKey;
      const writeStream = fs.createWriteStream(
        `${this.basePath}/${this.params.order}/${no}/${fileName}.${
          this.params.qrType
        }`
      );
      this.create(key).pipe(writeStream);
    });
  }
}

module.exports = Qr;
