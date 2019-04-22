'use strict';
const Service = require('../lib/DBService');

/**
 * User Service
 *
 * @class UserService
 * @extends {Service}
 */
class FileService extends Service {
  /**
   *Creates an instance of UserService.
   * @param {Object} ctx - context
   * @memberof UserService
   */
  constructor(ctx) {
    super(ctx, 'File');
  }
}

module.exports = FileService;
