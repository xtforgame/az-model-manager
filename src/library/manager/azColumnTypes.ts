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

type RawSchema = {
  columns: { [s: string]: any; };
  options?: { [s: string]: any; };
};

type RawSchemas = {
  models: { [s: string]: RawSchema; };
  associationModels?: { [s: string]: RawSchema; };
};

type RawSchemaType = 'model' | 'associationModel';

type SchemaFuncArgs = {
  schemas : RawSchemas;
  schema : RawSchema;
  name: string;
  schemaType : RawSchemaType;
};

// =========================================
export type TypeConfig = {
  sequleizeDataType?: AbstractDataTypeConstructor,
  associationType?: AssociationType,
  validateSchema(args : SchemaFuncArgs) : Error | null;
  getType(args : SchemaFuncArgs) : DataType;
};

export type TypeConfigs = {
  [s: string]: TypeConfig;
};

export const typeConfigs : TypeConfigs = {
  hasOne: {
    associationType: 'hasOne',
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  hasMany: {
    associationType: 'hasMany',
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  belongsTo: {
    associationType: 'belongsTo',
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  belongsToMany: {
    associationType: 'belongsToMany',
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },

  integer: { // AzModelTypeInteger
    sequleizeDataType: sequelize.INTEGER,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  bigint: { // AzModelTypeBigint
    sequleizeDataType: sequelize.BIGINT,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  decimal: { // AzModelTypeDecimal
    sequleizeDataType: sequelize.DECIMAL,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  real: { // AzModelTypeReal
    sequleizeDataType: sequelize.REAL,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  float: { // AzModelTypeFloat
    sequleizeDataType: sequelize.FLOAT,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  double: { // AzModelTypeDouble
    sequleizeDataType: sequelize.DOUBLE,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  boolean: { // AzModelTypeBoolean
    sequleizeDataType: sequelize.BOOLEAN,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  string: { // AzModelTypeString
    sequleizeDataType: sequelize.STRING,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  binary: { // AzModelTypeBinary
    sequleizeDataType: sequelize.BLOB,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  text: { // AzModelTypeText
    sequleizeDataType: sequelize.TEXT,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  date: { // AzModelTypeDate
    sequleizeDataType: sequelize.DATE,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  dateonly: { // AzModelTypeDateOnly
    sequleizeDataType: sequelize.DATEONLY,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  uuid: { // AzModelTypeUuid
    sequleizeDataType: sequelize.UUID,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  range: { // AzModelTypeRange
    sequleizeDataType: sequelize.RANGE,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  json: { // AzModelTypeJson
    sequleizeDataType: sequelize.JSON,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
  jsonb: { // AzModelTypeJsonb
    sequleizeDataType: sequelize.JSONB,
    validateSchema: (args : SchemaFuncArgs) => null,
    getType: (args : SchemaFuncArgs) => sequelize.INTEGER,
  },
};
