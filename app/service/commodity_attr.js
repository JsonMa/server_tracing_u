module.exports = (app) => {
  /**
   * 商品属性service
   *
   * @class CommodityAttr
   * @extends {app.Service}
   */
  class CommodityAttr extends app.Service {
    /**
     * 创建商品属性
     *
     * @param {uuid}    commodityId -商品ID
     * @param {string}    attrName    -属性名
     * @param {array}     attrValue   -属性值
     * @returns {promise} 创建的属性
     * @memberof CommodityAttr
     */
    create(commodityId, attrName, attrValue) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(uuidValidate(commodityId), 'commodityId需为uuid格式');
      assert(typeof attrName === 'string', 'attrName需为字符串');
      assert(Array.isArray(attrValue), 'attrValue需为数组');

      return this.app.model.CommodityAttr.create({
        name: attrName,
        values: attrValue,
        commodity_id: commodityId,
      });
    }

    /**
     * 获取商品属性
     *
     * @param {uuid} commodityId -商品ID
     * @memberof CommodityAttr
     * @returns {promise} 属性列表
     */
    fetch(commodityId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(uuidValidate(commodityId), 'commodityId需为uuid格式');

      return this.app.model.CommodityAttr.findAll({
        where: {
          commodity_id: commodityId,
        },
      });
    }

    /**
     * 获取属性详情
     *
     * @param {uuid} attrId       -属性ID
     * @param {uuid} commodityId  -商品ID
     * @returns {promise} 属性详情
     * @memberof CommodityAttr
     */
    getByIdOrThrow(attrId, commodityId) {
      const { assert, uuidValidate } = this.ctx.helper;

      assert(uuidValidate(attrId), 'attrId需为uuid格式');
      assert(uuidValidate(commodityId), 'commodityId需为uuid格式');

      return this.ctx.model.CommodityAttr.find({
        where: {
          id: attrId,
          commodity_id: commodityId,
        },
      }).then((attribute) => {
        this.ctx.error(attribute, '属性不存在', 13000);
        return attribute;
      });
    }
    /**
     * 验证属性名是否存在
     *
     * @param {string} attrName     -属性名称
     * @param {string} commodityId  -商品id
     * @memberof CommodityAttr
     * @returns {promise} 返回查询结果
     */
    isExisted(attrName, commodityId) {
      const { assert, uuidValidate } = this.ctx.helper;
      assert(typeof attrName === 'string', 'attrName需为字符串');
      assert(uuidValidate(commodityId), 'commodityId需为uuid格式');

      return this.app.model.CommodityAttr.find({
        where: {
          name: attrName,
          commodity_id: commodityId,
        },
      }).then((attribute) => {
        this.ctx.error(!attribute, '商品属性已存在', 13001);
      });
    }
  }
  return CommodityAttr;
};

