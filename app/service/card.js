const {
  Service,
} = require('egg');

/**
 * Card Service
 *
 * @class CardService
 * @extends {Service}
 */
class CardService extends Service {
  /**
   * 根据ids查找贺卡
   *
   * @param {[UUID]}   ids      -贺卡id数组
   * @memberof UserService
   * @returns {[User]} 用户数组
   */
  findByIds(ids) {
    const { assert } = this.ctx.helper;
    assert(ids instanceof Array, 'ids需为数组');

    return this.app.model.Card.findAll({
      where: {
        id: {
          $in: ids,
        },
      },
    });
  }

  /**
   * 获取用户列表
   *
   * @param {string}  userId      -商家Id
   * @param {string}  status      -用户状态
   * @param {string}  categoryId  -贺卡类别Id
   * @param {string}  start       -从第几条数据开始
   * @param {string}  count       -数据条数
   * @param {string}  sort        -是否排序
   * @memberof CardService
   * @returns {promise} 返回贺卡列表
   */
  fetch(userId, status, categoryId, start, count, sort) {
    const { assert, uuidValidate } = this.ctx.helper;

    /* istanbul ignore next */
    if (userId) assert(uuidValidate(userId), 'userId需为uuid格式');
    /* istanbul ignore next */
    if (categoryId) assert(uuidValidate(categoryId), 'categoryId需为uuid格式');
    /* istanbul ignore next */
    if (status) assert(status === 'NONBLANK' || status === 'BLANK', 'status需为BLANK或NONBLANK');

    assert(typeof start === 'number', 'start需为字符串');
    assert(typeof count === 'number', 'count需为字符串');
    assert(typeof sort === 'string', 'sort需为字符串');

    /* istanbul ignore next */
    const timeOrder = sort === 'true' ? ['updated_at', 'DESC'] : ['updated_at', 'ASC'];
    /* istanbul ignore next */
    const statusQuery = status === undefined ? { } : { status };
    const categoryQuery = categoryId === undefined ? { } :  {
      category_id: categoryId,
    };
    /* istanbul ignore next */
    const userQuery = userId === undefined ? { } : {
      user_id: userId,
    };

    return this.app.model.Card.findAndCountAll({
      where: {
        ...userQuery,
        ...statusQuery,
        ...categoryQuery,
      },
      offset: start,
      limit: count,
      order: [
        ['status', 'ASC'],
        timeOrder,
      ],
    });
  }

  /**
   * 创建贺卡
   *
   * @param {string}  userId      -商家Id
   * @param {string}  categoryId  -贺卡类型Id
   * @memberof CardService
   * @returns {promise} 返回创建的贺卡
   */
  create(userId, categoryId) {
    const { assert, uuidValidate } = this.ctx.helper;
    assert(uuidValidate(userId), 'userId需为uuid格式');

    return this.app.model.Card.create({
      user_id: userId,
      category_id: categoryId,
    });
  }

  /**
   * 获取贺卡详情
   *
   * @param {string} id    -贺卡ID
   * @memberof CardService
   * @returns {promise} 返回贺卡详情
   */
  getByIdOrThrow(id) {
    const { assert, uuidValidate } = this.ctx.helper;
    assert(uuidValidate(id), 'id需为uuid格式');

    return this.app.model.Card.findById(id).then((card) => {
      this.ctx.error(card, '贺卡不存在', 17001);
      return card;
    });
  }

  /**
   * 统计商家贺卡数量
   *
   * @param {string} id    -商家Id
   * @memberof CardService
   * @returns {promise} 返回贺卡详情
   */
  count(id) {
    const { assert, uuidValidate } = this.ctx.helper;
    assert(uuidValidate(id), 'id需为uuid格式');

    return this.app.model.Card.count({
      where: {
        user_id: id,
      },
    });
  }

  /**
   * 删除指定贺卡
   *
   * @param {uuid} id   - 贺卡id
   * @returns {promise} 被删除的贺卡
   * @memberof CardService
   */
  delete(id) {
    const { assert, uuidValidate } = this.ctx.helper;
    assert(uuidValidate(id), 'id需为uuid格式');

    return this.app.model.Card.destroy({
      where: {
        id,
      },
      force: true,
    });
  }
}

module.exports = CardService;

