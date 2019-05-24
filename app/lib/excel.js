// 'use strict';
// const excel = require('excel4node');
// const path = require('path');
// const workBook = new excel.Workbook();
// const style = workBook.createStyle({
//   font: {
//     color: '#FF0800',
//     size: 14,
//   },
//   numberFormat: '$#,##0.00; ($#,##0.00); -',
// });
// /**
//  * Excel class
//  *
//  * @class Excel
//  */
// class Excel {
//   /**
//    *Creates an instance of Qr.
//    * @param {Object} order - excel name
//    * @memberof Qr
//    */
//   constructor(order) {
//     this.workSheet = workBook.addWorksheet(order);
//     this.basePath = path.join(__dirname, '../../files');
//   }

//   /**
//    * 创建Qr
//    *
//    * @param {String} key - key
//    * @memberof Qr
//    * @return {undefined}
//    */
//   create(key) {
//     const {
//       baseUrl,
//       qrType,
//     } = this.params;
//     return qr.imageSync(`${baseUrl}/${key}`, {
//       type: qrType,
//       margin: 1,
//       size: 10,
//     });
//   }

//   /**
//    * create dir
//    *
//    * @memberof Compress
//    * @return {undefined}
//    */
//   createOrderDir() {
//     try {
//       const dirStat = fs.statSync(`${this.basePath}/${this.params.order}`);
//       assert(dirStat.isDirectory(), `目录名：${this.params.order}在files下不存在`);
//       return;
//     } catch (error) {
//       return fs.mkdirSync(`${this.basePath}/${this.params.order}`);
//     }
//   }

//   /**
//    * create qr dir
//    *
//    * @param {String} no - 溯源码编号
//    * @memberof Qr
//    * @return {undefined}
//    */
//   createQrDir(no) {
//     try {
//       const dirStat = fs.statSync(
//         `${this.basePath}/${this.params.order}/${no}`
//       );
//       assert(dirStat.isDirectory(), `目录名：${no}在files下不存在`); // 为true的话那么存在，如果为false不存在
//       return;
//     } catch (error) {
//       return fs.mkdirSync(`${this.basePath}/${this.params.order}/${no}`);
//     }
//   }

//   /**
//    * create file
//    *
//    * @param {String} no           - 溯源码编号
//    * @param {String} publicKey    - 溯源码公匙
//    * @param {String} privateKey   - 溯源码私匙
//    * @memberof Compress
//    * @return {undefined}
//    */
//   createFiles(no, publicKey, privateKey) {
//     this.createQrDir(no);
//     ['public', 'private'].forEach(fileName => {
//       const key = fileName === 'public' ? publicKey : privateKey;
//       const writeStream = fs.createWriteStream(
//         `${this.basePath}/${this.params.order}/${no}/${fileName}.${
//           this.params.qrType
//         }`
//       );
//       this.create(key).pipe(writeStream);
//     });
//   }
// }

// module.exports = Excel;
// Require library
const xl = require('excel4node');

// Create a new instance of a Workbook class
const wb = new xl.Workbook();

// Add Worksheets to the workbook
const ws = wb.addWorksheet('Sheet 1');
const ws2 = wb.addWorksheet('Sheet 2');

// Create a reusable style
const style = wb.createStyle({
  font: {
    color: '#000000',
    size: 12,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
});

// Set value of cell A1 to 100 as a number type styled with paramaters of style
ws.cell(1, 1)
  .number(100)
  .style(style);

// Set value of cell B1 to 200 as a number type styled with paramaters of style
ws.cell(1, 2)
  .number(200)
  .style(style);

// Set value of cell C1 to a formula styled with paramaters of style
ws.cell(1, 3)
  .formula('A1 + B1')
  .style(style);

// Set value of cell A2 to 'string' styled with paramaters of style
ws.cell(2, 1)
  .string('string')
  .style(style);

// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
ws.cell(3, 1)
  .bool(true)
  .style(style)
  .style({
    font: {
      size: 14,
    },
  });

wb.write('Excel.xlsx');
