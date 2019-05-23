// 'use strict';
// const compressing = require('compressing');
// const path = require('path');
// const eliminate = require('eliminate');
// const fs = require('fs');
// const basePath = path.join(__dirname, '../../files');
// compressing.tar.compressDir(`${basePath}/test2`, `${basePath}/test2.tar`).then(async () => {
//   console.log('success');
//   await eliminate(`${basePath}/test2`);
//   const fileStat = fs.statSync(`${basePath}/test2.tar`);
//   console.log(fileStat);
// }); // 创建压缩文件
