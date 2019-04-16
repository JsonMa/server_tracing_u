// @ts-nocheck
const {
  VError,
} = require('verror');
const assert = require('assert');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

module.exports = {


  /**
   * 设置通用返回格式的body
   *
   * @param {object} data - 实际返回数据
   *
   */
  set jsonBody(data) {
    this.assert(data && typeof data === 'object');
    this.body = {
      code: 200,
      msg: 'success',
      data,
    };
  },

  /**
   * 判断表达式，为假抛出verror异常
   *
   * @param {any}    expression    - 判断表达式
   * @param {string} message       - 异常信息
   * @param {number} [code=500]    - error code
   * @param {number} [status=200]  - http code
   * @param {error}  originalError - 原始error
   *
   * @return {undefined}
   */
  error(expression, message, code, status = 200, originalError) {
    /* istanbul ignore else */
    if (expression) {
      return;
    }

    this.assert(message && typeof message === 'string');
    this.assert(code && typeof code === 'number');

    this.type = 'json';
    const err = Object.assign(new VError({
      name: 'HUAYAN_ERROR',
      cause: originalError,
    }, message), {
      code,
      status,
    });

    this.throw(err);
  },

  /**
   * 验证输入参数是否合法，包括param, query, body
   *
   * @param {any} rule 参数校验规则
   * @param {any} [preprocessor=a => a] 参数预处理方法，默认返回原值
   * @returns {promise} 校验结果
   */
  validate(rule, ...preprocessors) {
    this.assert(rule && typeof rule === 'object');
    const preprocessor = preprocessors.length ? _.compose(...preprocessors) : a => a;

    const { params, query } = this;
    const { files: reqFiles, body } = this.request;

    /* istanbul ignore next */
    const files = reqFiles !== undefined ? { files: reqFiles } : {};
    const value = preprocessor(Object.assign({}, params, query, body, files));

    // ajv 会自己缓存已编译的rules
    const validater = this.helper.ajv.compile(rule);
    return validater(value).then(() => value);
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

    const { user } = this.state.auth;
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

    this.assert.equal(this.state.auth.role, '2', 403);
    if (userId) {
      const { user } = this.state.auth;
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

    const { user } = this.state.auth;
    this.assert(user, 403);
  },

  /**
   * 渲染文件
   *
   * @param {string} file 文件路径
   * @returns {steam} 文件流
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
   * @returns {Buffer} error buffer
   */
  renderError(err) {
    const { message = '服务器内部错误', status = 500 } = err;
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

    const { role } = this.state.auth;
    return role === '1';
  },
};
