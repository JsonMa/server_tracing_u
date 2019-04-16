const imagemin = require('imagemin');
// const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRe = require('imagemin-jpeg-recompress');
const imageminOptipng = require('imagemin-optipng');

module.exports = () => function* compressImage(next) {
  const pathArray = [];
  const { compress } = this.app.config;

  /* istanbul ignore next */
  const { files = [] } = this.request;
  files.forEach((file) => {
    /* istanbul ignore next */
    if (file && file.type.match(/[image|jpg|jpeg|png]/g).length > 0) {
      pathArray.push(file.path);
    }
  });

  yield imagemin(pathArray, compress.output_dir, {
    plugins: [
      imageminOptipng({ optimizationLevel: compress.png_level }),
      // imageminPngquant({ quality: compress.png_quality, speed: 10 }),
      imageminJpegRe({
        quality: compress.jpg_level,
        min: compress.jpg_quality,
      }),
    ],
  });

  yield next;
};
