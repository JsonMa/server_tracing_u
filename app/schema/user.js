'use strict';

module.exports = {
  properties: {
    role_id: {
      $ref: 'schema.definition#/role_id',
    },
    platform: {
      name: {
        $ref: 'schema.definition#/name',
      },
      email: {
        $ref: 'schema.definition#/email',
      },
      phone: {
        $ref: 'schema.definition#/mobile',
      },
    },
    factory: {
      type: 'object',
      properties: {
        name: {
          $ref: 'schema.definition#/name',
        },
        public_account: {
          type: 'string',
        },
        email: {
          $ref: 'schema.definition#/email',
        },
        contact: {
          $ref: 'schema.definition#/name',
        },
        phone: {
          $ref: 'schema.definition#/mobile',
        },
        license: {
          $ref: 'schema.definition#/oid',
        },
        receiving_info: {
          name: {
            $ref: 'schema.definition#/name',
          },
          phone: {
            $ref: 'schema.definition#/mobile',
          },
          address: {
            $ref: 'schema.definition#/address',
          },
        },
      },
    },
    business: {
      type: 'object',
      properties: {
        name: {
          $ref: 'schema.definition#/company',
        },
        address: {
          $ref: 'schema.definition#/address',
        },
        phone: {
          $ref: 'schema.definition#/mobile',
        },
        contact: {
          $ref: 'schema.definition#/name',
        },
        banner: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      additionalProperties: false,
    },
    courier: {
      type: 'object',
      properties: {
        company: {
          $ref: 'schema.definition#/company',
        },
        name: {
          $ref: 'schema.definition#/name',
        },
        phone: {
          $ref: 'schema.definition#/mobile',
        },
        employee_card: {
          $ref: 'schema.definition#/oid',
        },
      },
      additionalProperties: false,
    },
    salesman: {
      type: 'object',
      properties: {
        name: {
          $ref: 'schema.definition#/name',
        },
        phone: {
          $ref: 'schema.definition#/mobile',
        },
        address: {
          $ref: 'schema.definition#/address',
        },
        id_card: {
          $ref: 'schema.definition#/oid',
        },
      },
      additionalProperties: false,
    },
    unionId: {
      type: 'string',
    },
    inviter: {
      $ref: 'schema.definition#/oid',
    },
    role_type: {
      $ref: 'schema.definition#/role_type',
    },
  },
};
