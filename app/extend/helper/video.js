module.exports = {

  /**
   * video 分片获取 获取
   *
   * @param {string} rangeString range header
   * @param {number} size file size
   * @returns {object} range start and end
   */
  range(rangeString, size) {
    // 若同时指定了多个范围值，则直接返回null
    if (!!~rangeString.indexOf(',')) return null; // eslint-disable-line

    let string = rangeString;
    if (!!~string.indexOf('=')) string = string.substr(6, rangeString.length); // eslint-disable-line

    const range = string.split('-');
    let start = parseFloat(range[0]);
    let end = parseInt(range[1], 10) || size - 1;

    if (Number.isNaN(start)) {
      start = size - end;
      end = size - 1;
    }

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end > size) return null;

    return {
      start,
      end,
    };
  },
};
