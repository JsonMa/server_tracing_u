// @ts-nocheck
const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/banner.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async function () {
    await initiater.inject(['banner']);

    this.app.mockContext({
      state: {
        auth: {
          token: uuidv4(),
          role: '1',
          user: {
            id: initiater.userId,
          },
        },
      },
    });
  });

  afterEach(() => {
    initiater.destory();
  });

  it('should return banners', async () => {
    const resp = await app.httpRequest()
      .get('/banners')
      .expect(200);
    assert.equal(resp.body.data.count, 2);
  });

  describe('add banner', () => {
    it('should add banner successfully', async () => {
      const resp = await app.httpRequest()
        .post('/banners')
        .send({
          cover_id: initiater.values.file[0].id,
          video_url: 'http://1255680877.vod2.myqcloud.com/cceb63d0vodgzp1255680877/1eee082d4564972819039364800/2Xya3DCOAPcA.mp4',
        })
        .expect(200);
      assert.equal(resp.body.data.cover_id, initiater.values.file[0].id);
      this.mockBanner = resp.body.data;
    });

    after(async () => {
      await app.model.Banner.destroy({
        where: { id: this.mockBanner.id },
        force: true,
      });
    });
  });

  it('should update banner successfully', async () => {
    const resp = await app.httpRequest()
      .put(`/banners/${initiater.values.banner[0].id}`)
      .send({
        cover_id: initiater.values.file[0].id,
      })
      .expect(200);
    assert.equal(resp.body.data.cover_id, initiater.values.file[0].id);
  });

  it('should delete banner successfully', async () => {
    const resp = await app.httpRequest()
      .delete(`/banners/${initiater.values.banner[0].id}`)
      .expect(200);
    assert.equal(resp.body.data.id, initiater.values.banner[0].id);
  });
});
