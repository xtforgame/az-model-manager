import sequelize, {
  AbstractDataTypeConstructor,

  DataType,
  Model,
  ModelDefined,
  ModelAttributeColumnReferencesOptions,
  Deferrable,
} from 'sequelize';

import {
  ModelAttributes,
  ModelOptions,
  ModelAttributeColumnOptions,
} from '../../../core/utils';

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
} from '../../../core/columnTypes';

import {
  AmmSchema,
  AmmSchemasModelOptions,
  Overwrite,
} from '../../../core';

// ======== Associations ========

export type JsonModelAttributeHasOne = [
  AssociationTypeHasOne,
  string,
  HasOneOptions,
  AssociationColumnExtraOption?,
];

export type JsonModelAttributeHasMany = [
  AssociationTypeHasMany,
  string,
  HasManyOptions,
  AssociationColumnExtraOption?,
];

export type JsonModelAttributeBelongsTo = [
  AssociationTypeBelongsTo,
  string,
  BelongsToOptions,
  AssociationColumnExtraOption?,
];

export type JsonModelAttributeBelongsToMany = [
  AssociationTypeBelongsToMany,
  string,
  BelongsToManyOptions,
  AssociationColumnExtraOption?,
];

// ======== Numbers ========

export type JsonModelTypeInteger = 'integer'; // sequelize.INTEGER
export type JsonModelAttributeInteger = JsonModelTypeInteger | [
  JsonModelTypeInteger,
];

export type JsonModelTypeBigint = 'bigint'; // sequelize.BIGINT
export type JsonModelAttributeBigint = JsonModelTypeBigint | [
  JsonModelTypeBigint,
];

export type JsonModelTypeDecimal = 'decimal'; // sequelize.DECIMAL
export type JsonModelAttributeDecimal = JsonModelTypeDecimal | [
  JsonModelTypeDecimal,
  number?,
  number?,
];

export type JsonModelTypeReal = 'real'; // sequelize.REAL
export type JsonModelAttributeReal = JsonModelTypeReal | [
  JsonModelTypeReal,
];

export type JsonModelTypeFloat = 'float'; // sequelize.FLOAT
export type JsonModelAttributeFloat = JsonModelTypeFloat | [
  JsonModelTypeFloat,
];

export type JsonModelTypeDouble = 'double'; // sequelize.DOUBLE
export type JsonModelAttributeDouble = JsonModelTypeDouble | [
  JsonModelTypeDouble,
];

export type JsonModelTypeBoolean = 'boolean'; // sequelize.BOOLEAN
export type JsonModelAttributeBoolean = JsonModelTypeBoolean | [
  JsonModelTypeBoolean,
];

// ======== Strings ========

export type JsonModelTypeString = 'string'; // sequelize.STRING
export type JsonModelAttributeString = JsonModelTypeString | [
  JsonModelTypeString,
  number?,
];

export type JsonModelTypeBinary = 'binary'; // sequelize.STRING(0, true), sequelize.BLOB
export type JsonModelAttributeBinary = JsonModelTypeBinary | [
  JsonModelTypeBinary,
];

export type JsonModelTypeText = 'text'; // sequelize.TEXT
export type JsonModelAttributeText = JsonModelTypeText | [
  JsonModelTypeText,
];

// ======== Dates ========

export type JsonModelTypeDate = 'date'; // sequelize.DATE
export type JsonModelAttributeDate = JsonModelTypeDate | [
  JsonModelTypeDate,
];

export type JsonModelTypeDateOnly = 'dateonly'; // sequelize.DATEONLY
export type JsonModelAttributeDateOnly = JsonModelTypeDateOnly | [
  JsonModelTypeDateOnly,
];

// ======== Uuids ========

export type JsonModelTypeUuid = 'uuid'; // sequelize.UUID
export type JsonModelAttributeUuid = JsonModelTypeUuid | [
  JsonModelTypeUuid,
];

// ======== Ranges ========
export type JsonModelTypeRange = 'range'; // sequelize.RANGE
export type JsonModelAttributeRange = [
  JsonModelTypeRange,
  JsonModelTypeInteger | JsonModelTypeBigint | JsonModelTypeDecimal | JsonModelTypeDate | JsonModelTypeDateOnly,
];

// ======== JSONs ========
export type JsonModelTypeJson = 'json'; // sequelize.JSON
export type JsonModelAttributeJson = JsonModelTypeJson | [
  JsonModelTypeJson,
];

export type JsonModelTypeJsonb = 'jsonb'; // sequelize.JSONB
export type JsonModelAttributeJsonb = JsonModelTypeJsonb | [
  JsonModelTypeJsonb,
];

export type JsonModelAttributeColumn =
  JsonModelAttributeHasOne
  | JsonModelAttributeHasMany
  | JsonModelAttributeBelongsTo
  | JsonModelAttributeBelongsToMany

  | JsonModelAttributeInteger
  | JsonModelAttributeDecimal
  | JsonModelAttributeReal
  | JsonModelAttributeFloat
  | JsonModelAttributeDouble
  | JsonModelAttributeBigint
  | JsonModelAttributeBoolean

  | JsonModelAttributeString
  | JsonModelAttributeBinary
  | JsonModelAttributeText

  | JsonModelTypeDate
  | JsonModelTypeDateOnly

  | JsonModelAttributeUuid

  | JsonModelAttributeRange

  | JsonModelTypeJson
  | JsonModelTypeJsonb
;

// =========================================

export const deferrableMap : { [s: string]: any } = {
  initially_immediate: sequelize.Deferrable.INITIALLY_IMMEDIATE,
  initially_deferred: sequelize.Deferrable.INITIALLY_DEFERRED,
  not: sequelize.Deferrable.NOT,
};
export const toSqlzDeferrable = (text: 'initially_immediate' | 'initially_deferred' | 'not') : any | void => deferrableMap[text];

export type AmmModelAttributeColumnReferencesOptions =  Overwrite<ModelAttributeColumnReferencesOptions, {
  model?: string;
  key?: string;
  deferrable?: 'initially_immediate' | 'initially_deferred' | 'not';
  autogenerated?: boolean;
}>

export interface JsonModelAttributeColumnOptions<M extends Model = Model> {
  type : JsonModelAttributeColumn;
  ammReferences?: AmmModelAttributeColumnReferencesOptions;
}

export type JsonModelAttributeInOptionsForm<M extends Model = Model, TCreationAttributes = any, CEO = any> = Overwrite<ModelAttributeColumnOptions<M, CEO>, JsonModelAttributeColumnOptions<M>>;
export type NormalizedJsonModelAttributes<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  [name in keyof TCreationAttributes]: JsonModelAttributeInOptionsForm<M, TCreationAttributes, CEO>;
};


export type JsonModelAllAttributeType<M extends Model = Model, TCreationAttributes = any, CEO = any> = JsonModelAttributeInOptionsForm<M, TCreationAttributes, CEO> | JsonModelAttributeColumn;

export type JsonModelAttributes<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  [name in keyof TCreationAttributes]: JsonModelAllAttributeType<M, TCreationAttributes, CEO>;
};

export type IJsonSchema<ModelExtraOptions = any, CEO = any> = {
  columns: JsonModelAttributes<any, any, CEO>;
  options?: ModelOptions;
  extraOptions?: ModelExtraOptions;
};

export type IJsonSchemasModelOptions<ModelExtraOptions = any, ExtraOptions = any> = AmmSchemasModelOptions & {
  tablePrefix?: string;
};

export type IJsonSchemasOptions<ModelExtraOptions = any, ExtraOptions = any> = {
  model?: IJsonSchemasModelOptions<ModelExtraOptions, ExtraOptions>;
  associationModel?: IJsonSchemasModelOptions<ModelExtraOptions, ExtraOptions>;
};

export type IJsonSchemas<ModelExtraOptions = any, ExtraOptions = any, CEO = any> = {
  models: { [s: string]: IJsonSchema<ModelExtraOptions, CEO>; };
  associationModels: { [s: string]: IJsonSchema<ModelExtraOptions, CEO>; };
  options?: IJsonSchemasOptions<ModelExtraOptions, ExtraOptions>;
  extraOptions?: ExtraOptions;
};
