'use strict';

module.exports = app => {
  const { formidable, compress } = app.middleware;

  /* istanbul ignore next */
  const prefix = '/api';

  // auth
  app.post(`${prefix}/auth/login`, 'auth.login');
  app.get(`${prefix}/auth/logout`, 'auth.logout');

  // user
  app.get(`${prefix}/users`, 'user.index');
  app.get(`${prefix}/users/:id`, 'user.show');
  app.post(`${prefix}/users`, 'user.create');
  app.put(`${prefix}/users/:id`, 'user.update');
  app.get(`${prefix}/users/:id/statistics`, 'user.statistics');
  app.get(`${prefix}/users/:id/businesses`, 'user.business');
  app.get(`${prefix}/users/:id/factories`, 'user.factory'); // 由指定用户邀请的用户列表
  app.get(`${prefix}/users/:id/sales`, 'user.sales'); // 销售员的销售统计

  // commodity
  app.get(`${prefix}/commodities`, 'commodity.index');
  app.get(`${prefix}/commodities/:id`, 'commodity.show');
  app.post(`${prefix}/commodities`, 'commodity.create');
  app.delete(`${prefix}/commodities/:id`, 'commodity.destroy');
  app.put(`${prefix}/commodities/:id`, 'commodity.update');

  // commodity category
  app.get(`${prefix}/commodity_categories`, 'commodityCategory.index');
  app.get(`${prefix}/commodity_categories/:id`, 'commodityCategory.show');
  app.post(`${prefix}/commodity_categories`, 'commodityCategory.create');
  app.delete(`${prefix}/commodity_categories/:id`, 'commodityCategory.destory');
  app.put(`${prefix}/commodity_categories/:id`, 'commodityCategory.update');

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

  // order
  app.post(`${prefix}/orders`, 'order.create');
  app.get(`${prefix}/orders`, 'order.index');
  app.get(`${prefix}/orders/:id`, 'order.show');
  app.delete(`${prefix}/orders/:id`, 'order.destroy');
  app.put(`${prefix}/orders/:id`, 'order.update');

  // barcode
  app.post(`${prefix}/barcodes`, 'barcode.create');
  app.get(`${prefix}/barcodes/:barcode`, 'barcode.show');
  app.get(`${prefix}/barcodes`, 'barcode.index');
  app.delete(`${prefix}/barcodes/:id`, 'barcode.destroy');
  app.put(`${prefix}/barcodes/:barcode`, 'barcode.update');

  // tracing
  app.post(`${prefix}/tracings`, 'tracing.create');
  app.get(`${prefix}/tracings/:key`, 'tracing.show');
  app.get(`${prefix}/tracings`, 'tracing.index');
  app.put(`${prefix}/tracings/:key`, 'tracing.update');

  // counterfeit
  app.post(`${prefix}/counterfeits`, 'counterfeit.create');
  app.get(`${prefix}/counterfeits/:id`, 'counterfeit.show');
  app.get(`${prefix}/counterfeits`, 'counterfeit.index');
  app.put(`${prefix}/counterfeits/:id`, 'counterfeit.update');

  // miniprogram
  app.get(`${prefix}/mini_program/code`, 'miniProgram.code');
  app.post(`${prefix}/mini_program/user_info/phone`, 'miniProgram.phone');
};
