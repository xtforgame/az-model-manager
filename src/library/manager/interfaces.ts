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
  AzModelAttributeColumn,
} from './azColumnTypes';

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export interface AzModelAttributeColumnOptions<M extends Model = Model> {
  type : AzModelAttributeColumn;
}

export type AzModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
  [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M>, AzModelAttributeColumnOptions<M>>;
};

export type AzSchema = {
  columns: AzModelAttributes;
  options?: ModelOptions;
};

export type AzSchemas = {
  models: { [s: string]: AzSchema; },
  associationModels?: { [s: string]: AzSchema; }
};

// const p : AzSchemas = {
//   models: {
//     x: {
//       columns: {
//         hasOne: {
//           type: ['hasOne', 'x', {}],
//         },
//         hasMany: {
//           type: ['hasMany', 'x', {}],
//         },
//         belongsTo: {
//           type: ['belongsTo', 'x', {}],
//         },
//         belongsToMany: {
//           type: ['belongsToMany', 'x', { through: '' }],
//         },
//         ccc: {
//           type: 'decimal',
//         },
//       },
//       options: {},
//     },
//   },
// };
