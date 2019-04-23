'use strict';

module.exports = app => {
  const { formidable, compress } = app.middleware;
  // const wechat = require('co-wechat-body');

  /* istanbul ignore next */
  const prefix = app.config.noPrefix ? '' : '/api';

  // auth
  app.post(`${prefix}/auth/login`, 'auth.login');
  app.get(`${prefix}/auth/logout`, 'auth.logout');

  // user
  app.get(`${prefix}/users`, 'user.index');
  app.get(`${prefix}/users/:id`, 'user.show');
  app.post(`${prefix}/users`, 'user.create');
  app.put(`${prefix}/users/:id`, 'user.update');

  // // commodity
  // app.get(`${prefix}/commodities`, 'commodity.index');
  // app.get(`${prefix}/commodities/:id`, 'commodity.show');
  // app.post(`${prefix}/commodities`, 'commodity.create');
  // app.delete(`${prefix}/commodities`, 'commodity.batchDestroy');
  // app.put(`${prefix}/commodities`, 'commodity.batchUpdate');
  // app.put(`${prefix}/commodities/:id`, 'commodity.update');
  // app.post(`${prefix}/commodities/:id/attributes`, 'commodity.createAttribute');
  // app.get(`${prefix}/commodities/:id/attributes`, 'commodity.attributeIndex');
  // app.get(
  //   `${prefix}/commodities/:id/attributes/:attr_id`,
  //   'commodity.attributeShow'
  // );
  // app.put(
  //   `${prefix}/commodities/:id/attributes/:attr_id`,
  //   'commodity.attributeUpdate'
  // );
  // app.delete(
  //   `${prefix}/commodities/:id/attributes/:attr_id`,
  //   'commodity.destoryAttribute'
  // );

  // // commodity category
  // app.get(`${prefix}/commodity_categories`, 'commodityCategory.index');
  // app.post(`${prefix}/commodity_categories`, 'commodityCategory.create');
  // app.delete(
  //   `${prefix}/commodity_categories`,
  //   'commodityCategory.batchDestroy'
  // );
  // app.put(`${prefix}/commodity_categories/:id`, 'commodityCategory.update');

  // file
  app.get(`${prefix}/files/:id`, 'file.show');
  app.get(`${prefix}/files/:id/thumbnail`, 'file.thumbnail');
  app.delete(`${prefix}/files/:id`, 'file.delete');
  app.post(
    `${prefix}/files`,
    formidable(app.config.formidable),
    compress(),
    'file.upload'
  );

  // // banner
  // app.get(`${prefix}/banners`, 'banner.index');
  // app.post(`${prefix}/banners`, 'banner.create');
  // app.put(`${prefix}/banners/:id`, 'banner.update');
  // app.delete(`${prefix}/banners/:id`, 'banner.destroy');

  // // error
  // app.get('/error', 'error.index');

  // // order 订单
  // app.get(`${prefix}/orders`, 'order.list');
  // app.get(`${prefix}/orders/:id`, 'order.fetch');
  // app.put(`${prefix}/orders/:id`, 'order.patch');

  // // trade 交易
  // app.post(`${prefix}/trades`, 'trade.create');
  // app.get(`${prefix}/trades/:id`, 'trade.fetch');
  // app.post(`${prefix}/wechat_notify`, wechat(), 'trade.wechatNotify');

  // 小程序接口
  app.get(`${prefix}/mini_program/code`, 'miniProgram.code');
};
