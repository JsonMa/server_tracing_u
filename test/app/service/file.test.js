const Initiater = require('../../initiater');
const assert = require('assert');
const uuidv4 = require('uuid/v4');
const {
  app,
} = require('egg-mock/bootstrap');

describe('test/app/serivce/file.test.js', () => {
  const initiater = new Initiater(app);
  let ctx;

  beforeEach(async () => {
    await initiater.destory();
    await initiater.inject(['file']);
    ctx = app.mockContext();
  });

  after(async () => {
    await initiater.destory();
  });

  it('禁止引用不存在文件', async () => {
    try {
      await ctx.service.file.getByIdOrThrow(uuidv4());
    } catch (err) {
      assert.equal(err.code, 16000);
    }
  });

  it('获取文件', async () => {
    const file = await ctx.service.file.getByIdOrThrow(initiater._getRandomItem('file', { name: 'file1' }).id);
    assert.equal(file.id.toString(), initiater._getRandomItem('file', { name: 'file1' }).id.toString());
  });
});
