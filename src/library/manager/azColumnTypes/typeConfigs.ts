import sequelize, {
  AbstractDataTypeConstructor,
  Model,
  ModelAttributeColumnOptions,
} from 'sequelize';

import {
  AssociationType, HAS_ONE,
} from '../../core/columnTypes';

import {
  SchemaFuncArgs,
} from './interfaces';

// =========================================
export type TypeConfig = {
  sequleizeDataType?: AbstractDataTypeConstructor,
  associationType?: AssociationType,
  parseColumnSchema(args : SchemaFuncArgs) : Error | ModelAttributeColumnOptions<Model>;
};

export type TypeConfigs = {
  [s: string]: TypeConfig;
};

export const typeConfigs : TypeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    parseColumnSchema: (args : SchemaFuncArgs) => {
      if (args.column.type.length < 3) {
        return new Error('type.length < 3');
      }
      return {
        type: HAS_ONE(args.column.type, {}),
        ...args.column,
      };
    },
  },
  hasMany: {
    associationType: 'hasMany',
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  belongsTo: {
    associationType: 'belongsTo',
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },

  integer: { // AzModelTypeInteger
    sequleizeDataType: sequelize.INTEGER,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  bigint: { // AzModelTypeBigint
    sequleizeDataType: sequelize.BIGINT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  decimal: { // AzModelTypeDecimal
    sequleizeDataType: sequelize.DECIMAL,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  real: { // AzModelTypeReal
    sequleizeDataType: sequelize.REAL,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  float: { // AzModelTypeFloat
    sequleizeDataType: sequelize.FLOAT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  double: { // AzModelTypeDouble
    sequleizeDataType: sequelize.DOUBLE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  boolean: { // AzModelTypeBoolean
    sequleizeDataType: sequelize.BOOLEAN,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  string: { // AzModelTypeString
    sequleizeDataType: sequelize.STRING,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  binary: { // AzModelTypeBinary
    sequleizeDataType: sequelize.BLOB,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  text: { // AzModelTypeText
    sequleizeDataType: sequelize.TEXT,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  date: { // AzModelTypeDate
    sequleizeDataType: sequelize.DATE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  dateonly: { // AzModelTypeDateOnly
    sequleizeDataType: sequelize.DATEONLY,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  uuid: { // AzModelTypeUuid
    sequleizeDataType: sequelize.UUID,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  range: { // AzModelTypeRange
    sequleizeDataType: sequelize.RANGE,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  json: { // AzModelTypeJson
    sequleizeDataType: sequelize.JSON,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
  jsonb: { // AzModelTypeJsonb
    sequleizeDataType: sequelize.JSONB,
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
  },
};
