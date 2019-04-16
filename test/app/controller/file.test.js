const Initiater = require('../../initiater');
const uuidv4 = require('uuid/v4');

const {
  app,
  assert,
} = require('egg-mock/bootstrap');

describe('test/app/controller/file.test.js', () => {
  const initiater = new Initiater(app);
  let uploadedFile;

  beforeEach(async function () {
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

  it('should return uploaded files', async () => {
    const resp = await app.httpRequest()
      .post('/files')
      .field('name', 'MOCK_FILE_NAME')
      .attach('files', 'test/assets/upload_test.jpg')
      .expect(200);
    assert(resp.body.data[0].name === 'upload_test.jpg');
    [uploadedFile] = resp.body.data;
  });

  it('should return file', async () => {
    await app.httpRequest()
      .get(`/files/${uploadedFile.id}`)
      .expect('Content-Type', uploadedFile.type)
      .expect(200);
  });
});
