export * from './IJsonSchemas';

import {
  Model,
  IndexesOptions,
} from 'sequelize';
import { Liquid } from 'liquidjs';
import appRootPath from 'app-root-path';
import pgStructure, {
  Table,
  Column,
  Index,
  Db,
} from 'pg-structure';
import { capitalizeFirstLetter } from '../../../core/utils';
import {
  IJsonSchema,
  IJsonSchemas,
  JsonModelAllAttributeType,
  JsonModelAttributeInOptionsForm,
  NormalizedJsonModelAttributes,
  JsonModelAttributeColumn,
  IJsonSchemasOptions,
  AmmModelAttributeColumnReferencesOptions,
} from './IJsonSchemas';

import {
  typeConfigs,
} from './typeConfigs';

import {
  AmmSchema,
  AmmSchemas,
  Overwrite,
  ModelAttributeColumnOptions,
  getNormalizedModelOptions,
  BelongsToOptions,
} from '../../../core';

import {
  ModelOptions,
} from '../../../core';


// =======================

export interface RawModelAttributeColumnOptions<M extends Model = Model> {
  type : [string, ...any[]];
  ammReferences?: AmmModelAttributeColumnReferencesOptions;
}

export type RawModelAttributes<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  [name in keyof TCreationAttributes]: Overwrite<ModelAttributeColumnOptions<M, CEO>, RawModelAttributeColumnOptions<M>>;
};

export type RawSchema<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  columns: RawModelAttributes<M, TCreationAttributes, CEO>;
  options?: ModelOptions;
};

export type RawSchemas<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  models: { [s: string]: RawSchema<M, TCreationAttributes, CEO>; };
  associationModels?: { [s: string]: RawSchema<M, TCreationAttributes, CEO>; };
  options?: IJsonSchemasOptions;
};

export type RawSchemaType = 'model' | 'associationModel';

export type ParsedColumnInfo = JsonModelAttributeInOptionsForm & {
  columnNameInDb?: string;
  isForeignKey?: boolean;
  isAssociationColumn?: boolean;
};

export type ParsedIndexInfo = IndexesOptions & {
  // name: string;
  // unique: boolean;
  columns: string[];
};

export type ParsedTableInfo = {
  tableNameInDb?: string;
  isAssociationModel: boolean;
  primaryKey?: string;
  modelOptions: ModelOptions;
  columns: { [s: string]: ParsedColumnInfo };
  indexes: { [s: string]: ParsedIndexInfo };
};

export type SchemasMetadata = {
  models: {
    [s : string]: ParsedTableInfo;
  };
  associationModels: {
    [s : string]: ParsedTableInfo;
  };
  allModels: {
    [s : string]: ParsedTableInfo;
  };
};

export type NormalizeJsonFuncArgs<M extends Model = Model, TCreationAttributes = any, CEO = any> = {
  table : RawSchema<M, TCreationAttributes, CEO>;
  tableType : RawSchemaType;
  tableName : string;
  column : any;
  columnName : string;
};

export type ParseJsonFuncArgs<M extends Model = Model, TCreationAttributes = any, CEO = any>  = NormalizeJsonFuncArgs<M, TCreationAttributes, CEO> & {
  schemasMetadata: SchemasMetadata;

  schemas : RawSchemas<M, TCreationAttributes, CEO>;
};

