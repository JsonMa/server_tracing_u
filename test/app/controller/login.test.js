// @ts-nocheck
const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/login.test.js', () => {
  const initiater = new Initiater(app);

  beforeEach(async () => {
    await initiater.inject(['user']);

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
  });

  afterEach(() => {
    initiater.destory();
  });

  it('app login', async function () {
    const phone = '13896120331';
    const password = '123456';
    const resp = await app.httpRequest()
      .post('/auth/login')
      .send({
        phone,
        password,
      })
      .expect(this.varifyResponse);
    assert.equal(phone, resp.body.data.user.phone);
    this.user = resp.body.data;
  });

  it('user logout', async function () {
    await app.httpRequest()
      .get('/auth/logout')
      .set('access_token', this.user.token)
      .expect(200);
  });
});
