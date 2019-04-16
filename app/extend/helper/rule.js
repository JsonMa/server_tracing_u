module.exports = {
  uuidRegrex: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-4][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$',
  uuid: {
    type: 'string',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-4][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$',
  },
  pagination: {
    start: {
      type: 'number',
      minLength: 0,
      defualt: 0,
    },
    count: {
      type: 'number',
      minLength: 1,
      maxLength: 100,
      defualt: 10,
    },
    sort: {
      type: 'string',
      defualt: 'true',
    },

  },
  phone: {
    type: 'string',
    pattern: '^([1][0-9]{10})|(0[1-9]{2,3}-?[0-9]{7,8})$',
  },
  date: {
    type: 'string',
    format: 'date-time',
  },
  url: {
    type: 'string',
    pattern: '(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]',
  },
  file: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '.(jpg|JPG|jpeg|JPEG|png|PNG|xlsx|XLSX|xls|XLS|txt|TXT|gif|GIF|bmp|BMP|mp4|MP4|mp3|MP3|silk|m4a)$',
        maxLength: 128,
      },
      path: {
        type: 'string',
        maxLength: 128,
      },
      size: {
        type: 'number',
      },
      type: {
        type: 'string',
        maxLength: 128,
      },
    },
  },
};
