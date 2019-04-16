module.exports = (app) => {
  const {
    STRING,
    TEXT,
    UUID,
    UUIDV1,
    ENUM,
  } = app.Sequelize;

    /**
     * 交易Model
     *
     * @model Trade
     * @namespace Model
     * @property {uuid}     id
     * @property {uuid}     order_id - 内部订单号
     * @property {string}   trade_no - 外部订单号
     * @property {enum}     status   - 交易状态 ['PENDING', 'CLOSED', 'SUCCESS']
     * @property {string}   detail   - 支付详细信息, 序列化的JSON格式存储
     *
     */
  const Trade = app.model.define('trade', {
    id: {
      type: UUID,
      defaultValue: UUIDV1,
      primaryKey: true,
    },
    order_id: UUID,
    trade_no: {
      type: STRING(64),
      allowNull: true,
    },
    status: {
      type: ENUM,
      values: [
        'PENDING', // 挂起
        'CLOSED',
        'SUCCESS',
      ],
      allowNull: false,
      defaultValue: 'PENDING',
    },
    detail: {
      type: TEXT,
    },
  }, {
    getterMethods: {
      detail() {
        /* istanbul ignore next */
        return JSON.parse(this.getDataValue('detail'));
      },
    },

    setterMethods: {
      detail(value) {
        /* istanbul ignore next */
        this.setDataValue('detail', JSON.stringify(value));
      },
    },
  });

  Trade.STATUS = {
    PENDING: 'PENDING',
    CLOSED: 'CLOSED',
    SUCCESS: 'SUCCESS',
  };

  return Trade;
};

