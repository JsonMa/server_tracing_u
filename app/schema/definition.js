'use strict';

module.exports = {
  oid: {
    type: 'string',
    pattern: '^[abcdef0-9]{24}$',
  },
  str: {
    type: 'string',
    pattern: '^.{1,24}$',
  },
  text: {
    type: 'string',
    pattern: '^.{1,1024}$',
  },
  tel: {
    type: 'string',
    pattern: '^1[3,4,5,7,8,9]\\d{9}$',
  },
  mobile: {
    type: 'string',
    pattern: '(^\\d{7,11}$|^(\\w-*\\.*)+@(\\w-?)+(\\.\\w{2,})+$)',
  },
  email: {
    type: 'string',
    pattern: '^([a-zA-Z0-9_\\.\\-])+\\@(([a-zA-Z0-9\\-])+\\.)+([a-zA-Z0-9]{2,4})+$',
  },
  password: {
    type: 'string',
  },
  name: {
    type: 'string',
    maxLength: 5,
    minLength: 2,
  },
  company: {
    type: 'string',
    maxLength: 20,
    minLength: 2,
  },
  address: {
    type: 'string',
    maxLength: 30,
    minLength: 2,
  },
  role_id: {
    type: 'integer',
    minimum: 1,
    maximum: 32,
  },
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
    type: 'array',
    items: {
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
  },
};
