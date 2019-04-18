'use strict';

module.exports = {
  properties: {
    role: {
      type: 'integer',
      minimum: 1,
      maximum: 32,
    },
    business: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          maxLength: 5,
          minLength: 2,
        },
        public_account: {
          type: 'string',
          maxLength: 30,
          minLength: 10,
        },
        email: {
          type: 'string',
          format: 'email',
        },
        contact: {
          type: 'string',
          maxLength: 5,
          minLength: 2,
        },
        phone: {
          type: 'string',
        },
        license: {
          type: 'string',
        },
        receiving_info: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              maxLength: 5,
              minLength: 2,
            },
            phone: {
              type: 'string',
            },
            address: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    courier: {
      company: {
        type: 'string',
      },
      name: {
        type: 'string',
        maxLength: 5,
        minLength: 2,
      },
      phone: {
        type: 'string',
      },
      employee_card: {
        type: 'string',
      },
    },
    salesman: {
      name: {
        type: 'string',
        maxLength: 5,
        minLength: 2,
      },
      phone: {
        type: 'string',
      },
      address: {
        type: 'string',
      },
      id_card: {
        type: 'string',
      },
    },
    unionId: {
      type: 'string',
    },
    inviter: {
      type: 'string',
    },
  },
};
