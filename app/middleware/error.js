'use strict';

const {
  VError,
} = require('verror');

module.exports = () =>
  function* (next) {
    try {
      yield next;
    } catch (e) {
      /* istanbul ignore next */
      if ((this.app.isProd || this.app.isTest) && !this.is('json')) throw e;
      /* istanbul ignore next */
      this.app.logger.error('');
      if (e.name === 'AJV_ERROR') {
        this.body = {
          code: 400,
          msg: e.jse_shortmsg,
          errors: this.app.isProd ? undefined : e.jse_info,
        };
        this.status = 400;
      } else if (e instanceof VError) {
        this.body = {
          code: e.code,
          msg: e.message,
          errors: this.app.isProd ? undefined : e.stack,
        };
        this.status = e.status || 200;
      } else {
        // http error caused by ctx.assert || assert
        this.body = {
          code: 10001,
          msg: e.message || '服务器内部错误',
          errors: this.app.isProd ? undefined : e.stack,
        };
        this.status = e.status || 500;
      }
    }
  };
