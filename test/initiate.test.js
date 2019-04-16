const {
  app,
} = require('egg-mock/bootstrap');
const assert = require('assert');

before(async function () {
  this.app = app;
  this.varifyResponse = function (resp) {
    assert.equal(resp.status, 200);
    assert.equal(resp.body.code, 200);
  };

  // 注意：运行Test会清空数据库
  await app.model.sync({
    force: true,
  });
});

after(async function () {
  this.app.close();
});

beforeEach(() => {
  app.mockCsrf();
});
