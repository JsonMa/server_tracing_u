'use strict';

const {
  VError,
} = require('verror');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

module.exports = {

  get jsonBody() {
    return this.body;
  },

  /**
   * 设置通用返回格式的body
   *
   * @param {object} obj - 实际返回数据
   *
   */
  set jsonBody(obj) {
    const {
      data,
      meta = {},
      embed = {},
    } = obj;
    this.assert(data && typeof data === 'object', 'jsonBody 传入data应为Object');

    this.body = {
      meta,
      embed,
      data,
    };
  },

  error(name = 'TRACING_ERROR', message, code, httpStatus = 500, stack) {
    this.assert(message && typeof message === 'string');
    this.assert(code && typeof code === 'number');

    this.type = 'json';
    const err = Object.assign(new VError({
      name,
      cause: stack,
    }, message), {
      code,
      httpStatus,
    });

    this.throw(err);
  },

  async verify(rule, params) {
    const ret = await this.validate(rule, params).catch(function(e) {
      throw new VError({
        name: 'AJV_ERROR',
        cause: e,
        info: e.errors.reduce((map, e) => {
          map[e.keyword] = e.message;
          return map;
        }),
      }, '错误的请求参数');
    });
    return ret;
  },

  /**
   * 检查用户权限, 检查失败直接抛出403异常
   *
   * @param {uuid} userId 如果当前用户为admin, 则不检查；如果user为普通用户，检测当前用户id是否为user_id
   * @return {undefined}
   */
  checkPermission(userId) {
    assert(userId, 'userId is required');
    this.assert(this.state.auth, '使用了用户认证，但未开启auth中间件', 500);

    /* istanbul ignore next */
    if (this.state.auth.role === '1') {
      return;
    }

    const {
      user,
    } = this.state.auth;
    this.assert(user, 403);
    this.assert.equal(user.id, userId, 403);
  },

  /**
   * 检查当前用户是否是普通用户
   * @param {uuid} userId 可为空，不为空时检查是否是当前登录用户
   * @return {undefined}
   */
  userPermission(userId) {
    this.assert(this.state.auth, '使用了用户认证，但未开启auth中间件', 500);

    this.assert.equal(this.state.auth.role, '32', 403);
    if (userId) {
      const {
        user,
      } = this.state.auth;
      this.assert(user, 403);
      this.assert.equal(user.id, userId, 403);
    }
  },

  /**
   * 检查当前用户是否是管理员
   *
   * @param {integer} roleIds 合法的角色id数组
   * @return {undefined}
   */
  adminPermission(roleIds) {
    this.assert(this.state.auth, '使用了用户认证，但未开启auth中间件', 500);
    this.assert.equal(this.state.auth.role, '1', 403);

    /* istanbul ignore if */
    if (roleIds) {
      assert(roleIds instanceof Array);
      this.assert(roleIds.indexOf(this.state.auth.user.role_id) >= 0, 403);
    }
  },

  /**
   * 检查用户是否登录, 检查失败直接抛出403异常
   *
   * @return {undefined}
   */
  authPermission() {
    this.assert(this.state.auth, '使用了用户认证，但未开启auth中间件', 500);

    const {
      user,
    } = this.state.auth;
    this.assert(user, 403);
  },

  /**
   * 渲染文件
   *
   * @param {string} file 文件路径
   * @return {steam} 文件流
   */
  render(file) {
    /* istanbul ignore next */
    this.type = 'html';
    return fs.createReadStream(path.join(this.app.baseDir, 'app/public', file));
  },

  /**
   * 渲染error
   *
   * @param {object} err 错误信息
   * @return {Buffer} error buffer
   */
  renderError(err) {
    const {
      message = '服务器内部错误', status = 500,
    } = err;
    const errorView = this.app.errorTemplate.replace(/{{ error_status }}/gi, status).replace(/{{ error_message }}/gi, message);
    return Buffer.from(errorView);
  },

  /**
   * 验证用户是否为管理员
   *
   * @return {boolean} 返回验证结果
   */
  isAdmin() {
    this.assert(this.state.auth, '使用了用户认证，但未开启auth中间件', 500);

    const {
      role,
    } = this.state.auth;
    return role === '1';
  },

  get errors() {
    return {
      EMONGODB: 'MONGO_ERROR',
    };
  },
};
