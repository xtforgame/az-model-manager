import sequelize,{
  AbstractDataTypeConstructor,

  DataType,
  Model,
  ModelDefined,
  ModelAttributes,
  ModelOptions,
  ModelAttributeColumnOptions,
} from 'sequelize';

import {
  AssociationColumn,
  AssociationColumnOption,

  AssociationType,

  AssociationTypeHasOne,
  AssociationTypeHasMany,
  AssociationTypeBelongsTo,
  AssociationTypeBelongsToMany,

  HasOneOptions,
  HasManyOptions,
  BelongsToOptions,
  BelongsToManyOptions,

  AssociationColumnExtraOption,

  ASSOCIATION,
} from '../core/columnTypes';

import {
  Schema,
} from '../core';

// ======== Associations ========

export type AzModelAttributeHasOne = [
  AssociationTypeHasOne,
  string,
  HasOneOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeHasMany = [
  AssociationTypeHasMany,
  string,
  HasManyOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeBelongsTo = [
  AssociationTypeBelongsTo,
  string,
  BelongsToOptions,
  AssociationColumnExtraOption?,
];

export type AzModelAttributeBelongsToMany = [
  AssociationTypeBelongsToMany,
  string,
  BelongsToManyOptions,
  AssociationColumnExtraOption?,
];

// ======== Numbers ========

export type AzModelTypeInteger = 'integer'; // sequelize.INTEGER
export type AzModelAttributeInteger = AzModelTypeInteger | [
  AzModelTypeInteger,
];

export type AzModelTypeBigint = 'bigint'; // sequelize.BIGINT
export type AzModelAttributeBigint = AzModelTypeBigint | [
  AzModelTypeBigint,
];

export type AzModelTypeDecimal = 'decimal'; // sequelize.DECIMAL
export type AzModelAttributeDecimal = AzModelTypeDecimal | [
  AzModelTypeDecimal,
  number?,
  number?,
];

export type AzModelTypeReal = 'real'; // sequelize.REAL
export type AzModelAttributeReal = AzModelTypeReal | [
  AzModelTypeReal,
];

export type AzModelTypeFloat = 'float'; // sequelize.FLOAT
export type AzModelAttributeFloat = AzModelTypeFloat | [
  AzModelTypeFloat,
];

export type AzModelTypeDouble = 'double'; // sequelize.DOUBLE
export type AzModelAttributeDouble = AzModelTypeDouble | [
  AzModelTypeDouble,
];

export type AzModelTypeBoolean = 'boolean'; // sequelize.BOOLEAN
export type AzModelAttributeBoolean = AzModelTypeBoolean | [
  AzModelTypeBoolean,
];

// ======== Strings ========

export type AzModelTypeString = 'string'; // sequelize.STRING
export type AzModelAttributeString = AzModelTypeString | [
  AzModelTypeString,
  number,
];

export type AzModelTypeBinary = 'binary'; // sequelize.STRING(0, true), sequelize.BLOB
export type AzModelAttributeBinary = AzModelTypeBinary | [
  AzModelTypeBinary,
];

export type AzModelTypeText = 'text'; // sequelize.TEXT
export type AzModelAttributeText = AzModelTypeText | [
  AzModelTypeText,
];

// ======== Dates ========

export type AzModelTypeDate = 'date'; // sequelize.DATE
export type AzModelAttributeDate = AzModelTypeDate | [
  AzModelTypeDate,
];

export type AzModelTypeDateOnly = 'dateonly'; // sequelize.DATEONLY
export type AzModelAttributeDateOnly = AzModelTypeDateOnly | [
  AzModelTypeDateOnly,
];

// ======== Uuids ========

export type AzModelTypeUuid = 'uuid'; // sequelize.UUID
export type AzModelAttributeUuid = AzModelTypeUuid | [
  AzModelTypeUuid,
];

// ======== Ranges ========
export type AzModelTypeRange = 'range // sequelize.RANGE';
export type AzModelAttributeRange = [
  AzModelTypeRange,
  AzModelTypeInteger | AzModelTypeBigint | AzModelTypeDecimal | AzModelTypeDate | AzModelTypeDateOnly,
];

// ======== JSONs ========
export type AzModelTypeJson = 'json'; // sequelize.JSON
export type AzModelAttributeJson = AzModelTypeJson | [
  AzModelTypeJson,
];

export type AzModelTypeJsonb = 'jsonb'; // sequelize.JSONB
export type AzModelAttributeJsonb = AzModelTypeJsonb | [
  AzModelTypeJsonb,
];

export type AzModelAttributeColumn =
  AzModelAttributeHasOne
  | AzModelAttributeHasMany
  | AzModelAttributeBelongsTo
  | AzModelAttributeBelongsToMany

  | AzModelAttributeInteger
  | AzModelAttributeDecimal
  | AzModelAttributeReal
  | AzModelAttributeFloat
  | AzModelAttributeDouble
  | AzModelAttributeBigint
  | AzModelAttributeBoolean

  | AzModelAttributeString
  | AzModelAttributeBinary
  | AzModelAttributeText

  | AzModelTypeDate
  | AzModelTypeDateOnly

  | AzModelAttributeRange

  | AzModelTypeJson
  | AzModelTypeJsonb
;

// =========================================

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
  models: { [s: string]: AzSchema; };
  associationModels?: { [s: string]: AzSchema; };
};

export interface RawModelAttributeColumnOptions<M extends Model = Model> {
  type : [string, ...any[]];
}

export type RawModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
  [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M>, RawModelAttributeColumnOptions<M>>;
};

type RawSchema = {
  columns: RawModelAttributes;
  options?: ModelOptions;
};

type RawSchemas = {
  models: { [s: string]: RawSchema; };
  associationModels?: { [s: string]: RawSchema; };
};

type RawSchemaType = 'model' | 'associationModel';

type SchemaFuncArgs = {
  schemas : RawSchemas;
  table : RawSchema;
  tableType : RawSchemaType;
  tableName : string;
  column : any;
  columnName : string;
};

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
    parseColumnSchema: (args : SchemaFuncArgs) => ({ type: '' }),
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
