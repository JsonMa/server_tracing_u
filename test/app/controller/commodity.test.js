// @ts-nocheck
const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/commodity.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async () => {
    await initiater.inject(['commodity']);

    app.mockContext({
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

  it('should return commodities', async () => {
    const commodity = initiater._getRandomItem('commodity');
    const commodityCategory = initiater._getRandomItem('commodity_category');

    const resp = await app.httpRequest()
      .get('/commodities')
      .send({
        name: commodity.name,
        category_id: commodityCategory.id,
        status: commodity.status,
        start: '0',
        count: '10',
        sort: 'true',
        embed: 'category',
      })
      .expect(200);
    assert(resp.body.data.count === 1);
  });

  it('should return commodity detail', async () => {
    const commodity = initiater._getRandomItem('commodity');

    const resp = await app.httpRequest()
      .get(`/commodities/${commodity.id}`)
      .expect(200);
    assert(resp.body.data.id === commodity.id);
  });

  describe('add commodity', () => {
    it('should add commodity successfully', async () => {
      const commodityCategory = initiater._getRandomItem('commodity_category');

      const resp = await app.httpRequest()
        .post('/commodities')
        .send({
          name: 'MOCK-COMMODITY',
          category_id: commodityCategory.id,
          description: 'MOCK-DESCRIPTION',
          price: 10.232,
          act_price: 10.322,
          recommended: true,
          attr: [
            {
              attr_name: 'mock-attr-name01',
              attr_value: [
                'mock-attr-value01',
                'mock-attr-value02',
                'mock-attr-value03',
              ],
            },
            {
              attr_name: 'mock-attr-name02',
              attr_value: [
                'mock-attr-value01',
                'mock-attr-value02',
                'mock-attr-value03',
              ],
            },
          ],
          picture_ids: [
            initiater.values.file[0].id,
          ],
        })
        .expect(200);
      assert(resp.body.data.name === 'MOCK-COMMODITY');

      this.mockCommodity = resp.body.data;
    });

    after(async () => {
      await app.model.Commodity.destroy({
        where: { id: this.mockCommodity.id },
        force: true,
      });

      await app.model.CommodityAttr.destroy({
        where: { commodity_id: this.mockCommodity.id },
        force: true,
      });
    });
  });

  it('should update commodity successfully', async () => {
    const commodity = initiater._getRandomItem('commodity');
    const commodityCategory = initiater._getRandomItem('commodity_category');
    const resp = await app.httpRequest()
      .put(`/commodities/${commodity.id}`)
      .send({
        name: 'MOCK-COMMODITY',
        category_id: commodityCategory.id,
        description: 'MOCK-DESCRIPTION',
        price: 0,
        act_price: null,
        recommended: false,
        picture_ids: [
          initiater.values.file[0].id,
        ],
      })
      .expect(200);
    assert(resp.body.data.id === commodity.id);
  });

  it('should batch update commodities successfully', async () => {
    const injectedCommodity = initiater.values.commodity;

    const resp = await app.httpRequest()
      .put(`/commodities?ids=${injectedCommodity[0].id},${injectedCommodity[1].id}`)
      .send({
        status: 'OFF',
        recommended: true,
      })
      .expect(200);

    assert(resp.body.data[0].status === 'OFF');
  });

  it('should batch delete commodities successfully', async () => {
    const injectedCommodity = initiater.values.commodity;

    const resp = await app.httpRequest()
      .delete(`/commodities?ids=${injectedCommodity[0].id},${injectedCommodity[1].id}`)
      .expect(200);

    // 验证被删除的行数
    assert(resp.body.data.length === 2);
  });
});

