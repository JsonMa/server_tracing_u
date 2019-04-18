'use strict';

const {
  VError,
} = require('verror');

module.exports = () => function* (next) {
  try {
    yield next;
  } catch (e) {
    /* istanbul ignore next */
    if ((this.app.isProd || this.app.isTest) && !this.is('json')) throw e;
    /* istanbul ignore next */
    if (e.name === 'AJV_ERROR') {
      this.body = {
        code: 400,
        msg: e.message,
        errors: this.app.isProd ? undefined : e.jse_info,
      };
      this.status = 400;
    } else if (e instanceof VError) {
      this.body = {
        code: e.code,
        msg: e.message,
        errors: this.app.isProd ? undefined : [e],
      };
      this.status = e.status;
    } else if (e.status && e.statusCode) { // http error caused by ctx.assert
      this.body = {
        code: e.status,
        msg: e.message,
        errors: this.app.isProd ? undefined : [e],
      };
    } else {
      throw e;
    }
  }
};
