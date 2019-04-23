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
          message: e.jse_shortmsg,
          errors: this.app.isProd ? undefined : e.jse_info,
        };
        this.status = 400;
      } else if (e instanceof VError) {
        this.body = {
          message: e.message,
          errors: this.app.isProd ? undefined : e.stack,
        };
        this.status = e.status || 500;
      } else {
        // http error caused by ctx.assert
        this.body = {
          message: '服务器内部错误',
          errors: this.app.isProd ? undefined : e.stack,
        };
        this.status = e.status || 500;
      }
    }
  };
