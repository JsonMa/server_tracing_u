// @ts-nocheck
const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/commodity_category.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async function () {
    await initiater.inject(['commodity_category']);

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

    app.mockCsrf();
  });

  afterEach(() => {
    initiater.destory();
  });

  it('should return commodity categories', async () => {
    const resp = await app.httpRequest()
      .get('/commodity_categories')
      .send({
        start: '0',
        count: '1',
        sort: 'true',
      })
      .expect(200);
    assert(resp.body.data.items.length === 1);
  });

  describe('test/app/controller/commodity.test.js', () => {
    it('should add commodity category successfully', async () => {
      const resp = await app.httpRequest()
        .post('/commodity_categories')
        .send({
          name: 'CATEGORY',
          cover_id: initiater.values.file[0].id,
        })
        .expect(200);
      assert(resp.body.data.name === 'CATEGORY');
      this.mockCategory = resp.body.data;
    });

    after(async () => {
      await app.model.CommodityCategory.destroy({
        where: { id: this.mockCategory.id },
        force: true,
      });
    });
  });

  it('should batch delete commodity category successfully', async () => {
    const commodityCategory = initiater._getRandomItem('commodity_category');

    const resp = await app.httpRequest()
      .delete(`/commodity_categories?ids=${commodityCategory.id}`)
      .expect(200);
    assert(resp.body.data[0].id === commodityCategory.id);
  });

  it('should update commodity category successfully', async () => {
    const commodityCategory = initiater._getRandomItem('commodity_category');

    const resp = await app.httpRequest()
      .put(`/commodity_categories/${commodityCategory.id}`)
      .send({
        name: 'CATEGORY',
        cover_id: initiater.values.file[0].id,
      })
      .expect(200);
    assert(resp.body.data.name === 'CATEGORY');
  });
});
