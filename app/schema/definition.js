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
};
