const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/commodity_attribute.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async function () {
    await initiater.inject(['commodity_attr']);

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

  describe('test/app/controller/commodity.test.js', () => {
    it('should create commodity attribute successfully', async () => {
      const commodity = initiater._getRandomItem('commodity');
      const resp = await app.httpRequest()
        .post(`/commodities/${commodity.id}/attributes`)
        .send({
          attr_name: 'ATTRIBUTE-TEST',
          attr_value: ['ATTRIBUTE-VALUE', 'ATTRIBUTE-VALUE2'],
        })
        .expect(200);
      assert(resp.body.data.name === 'ATTRIBUTE-TEST');
      this.mockAttrubute = resp.body.data;
    });

    after(async () => {
      await app.model.CommodityAttr.destroy({
        where: { id: this.mockAttrubute.id },
        force: true,
      });
    });
  });

  it('should return commodity attributes successfully', async () => {
    const commodity = initiater._getRandomItem('commodity');

    const resp = await app.httpRequest()
      .get(`/commodities/${commodity.id}/attributes`)
      .expect(200);
    assert(resp.body.data.length === 2);
  });

  it('should return commodity detail successfully', async () => {
    const commodityAttr = initiater._getRandomItem('commodity_attr');

    const resp = await app.httpRequest()
      .get(`/commodities/${commodityAttr.commodity_id}/attributes/${commodityAttr.id}`)
      .expect(200);
    assert(resp.body.data.id === commodityAttr.id);
  });

  it('should update commodity attribute successfully', async () => {
    const commodityAttr = initiater._getRandomItem('commodity_attr');

    const resp = await app.httpRequest()
      .put(`/commodities/${commodityAttr.commodity_id}/attributes/${commodityAttr.id}`)
      .send({
        attr_name: 'ATTRIBUTE-UPDATE',
        attr_value: ['ATTRIBUTE-UPDATE', 'ATTRIBUTE-UPDATE2'],
      })
      .expect(200);
    assert(resp.body.data.name === 'ATTRIBUTE-UPDATE');
  });

  it('should delete commodity attribute successfully', async () => {
    const commodityAttr = initiater._getRandomItem('commodity_attr');

    const resp = await app.httpRequest()
      .delete(`/commodities/${commodityAttr.commodity_id}/attributes/${commodityAttr.id}`)
      .expect(200);
    assert(resp.body.data.id === commodityAttr.id);
  });
});
