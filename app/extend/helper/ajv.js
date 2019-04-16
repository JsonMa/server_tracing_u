const Ajv = require('ajv');

const ajv = new Ajv({
  useDefaults: true,
});

/*
 * request 的 参数是字符串，使用number无法通过测试
 */
/* istanbul ignore next */
ajv.addKeyword('range', {
  type: 'string',
  compile(sch, parentSchema) {
    const min = sch[0];
    const max = sch[1];

    return parentSchema.exclusiveRange === true ?
      function (data) {
        return parseInt(data, 10) > min && parseInt(data, 10) < max;
      } :
      function (data) {
        return parseInt(data, 10) >= min && parseInt(data, 10) <= max;
      };
  },
  errors: false,
  metaSchema: {
    type: 'array',
    items: [{
      type: 'number',
    }, {
      type: 'number',
    }],
    additionalItems: false,
  },
});

module.exports = ajv;
