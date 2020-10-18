import sequelize, {
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
} from '../../core/columnTypes';

import {
  Schema,
  Overwrite,
} from '../../core';

export * from './JsonSchemas';

export interface RawModelAttributeColumnOptions<M extends Model = Model> {
  type : [string, ...any[]];
}

export type RawModelAttributes<M extends Model = Model, TCreationAttributes = any> = {
  [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M>, RawModelAttributeColumnOptions<M>>;
};

export type RawSchema = {
  columns: RawModelAttributes;
  options?: ModelOptions;
};

export type RawSchemas = {
  models: { [s: string]: RawSchema; };
  associationModels?: { [s: string]: RawSchema; };
};

export type RawSchemaType = 'model' | 'associationModel';

export type ParsedTableInfo = {
  primaryKey?: string,
};

export type ParsedInfo = {
  tables: {
    [s : string]: ParsedTableInfo;
  };
  associationTables: {
    [s : string]: ParsedTableInfo;
  };
};

export type SchemaFuncArgs = {
  parsedInfo: ParsedInfo;

  schemas : RawSchemas;
  table : RawSchema;
  tableType : RawSchemaType;
  tableName : string;
  column : any;
  columnName : string;
};
