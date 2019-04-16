module.exports = {
  pagination(origin) {
    const { start = 0, count = 10, sort = 'true' } = origin;
    return Object.assign({}, origin, {
      start: parseInt(start, 10),
      count: parseInt(count, 10),
      sort,
    });
  },
};
