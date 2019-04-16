module.exports = (app) => {
  /**
   * error相关Controller
   *
   * @class errorController
   * @extends {app.Controller}
   */
  class errorController extends app.Controller {
    /**
     * render error
     *
     * @memberof errorController
     * @returns {promise} 无返回
     */
    async index() {
      const { ctx } = this;
      ctx.body = ctx.renderError({ status: 404, message: '找不到相关资源' });
      ctx.type = 'text/html';
    }
  }
  return errorController;
};

