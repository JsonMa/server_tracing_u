const formidable = require('formidable');
const assert = require('assert');
const { VError } = require('verror');

module.exports = options => function* (next) {
  // this.authPermission();
  const form = new formidable.IncomingForm();
  assert(typeof options === 'object', 'options需为对象');

  Object.assign(form, options);

  yield new Promise((resolve, reject) => {
    form.parse(this.req, (err, reqFields, reqFile) => {
      /* istanbul ignore next */
      if (err) reject(err);
      const { files } = reqFile;

      /* istanbul ignore next */
      if (files) this.request.files = Array.isArray(files) ? files : [files];
      resolve();
    });

    form.on('fileBegin', (name, file) => {
      const validate = /.(jpg|jpeg|png|xlsx|xls|txt|gif|bmp|mp4|mp3|silk|m4a)$/i.test(file.name);
      /* istanbul ignore next */
      if (!validate) {
        // 停止接收文件并抛出错误
        this.set('Connection', 'close');
        const err = Object.assign(new VError({
          name: 'FILE_ERROR',
          cause: undefined,
        }, '文件类型错误'), {
          code: 16001,
          status: 400,
        });
        reject(err);
      }
    });

    form.on('progress', (bytesExpected) => {
      /* istanbul ignore next */
      if (bytesExpected > 10 * 1024 * 1024) {
        // 停止接收文件并抛出错误
        this.set('Connection', 'close');
        const err = Object.assign(new VError({
          name: 'FILE_ERROR',
          cause: undefined,
        }, '文件大小超出限制'), {
          code: 16002,
          status: 413,
        });
        reject(err);
      }
    });
  });

  yield next;
};
