/* eslint-disable no-param-reassign, no-underscore-dangle, no-multi-assign, no-unused-expressions */
import {
  Sequelize,
  Model,
  ModelDefined,
  ModelAttributes,
  ModelOptions,
  ModelAttributeColumnOptions,
} from 'sequelize';
import {
  AzSchemas,
} from './azColumnTypes';

export * from './azColumnTypes';

const p : AzSchemas = {
  models: {
    x: {
      columns: {
        hasOne: {
          type: ['hasOne', 'x', {}],
        },
        hasMany: {
          type: ['hasMany', 'x', {}],
        },
        belongsTo: {
          type: ['belongsTo', 'x', {}],
        },
        belongsToMany: {
          type: ['belongsToMany', 'x', { through: '' }],
        },
        ccc: {
          type: 'decimal',
        },
      },
      options: {},
    },
  },
};
