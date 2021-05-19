export * from './IJsonSchemas';

import {
  Model,
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
  ColumnExtraOptions,
} from '../../../core';

import {
  ModelOptions,
} from '../../../core';


// =======================

export interface RawModelAttributeColumnOptions<M extends Model = Model> {
  type : [string, ...any[]];
  ammReferences?: AmmModelAttributeColumnReferencesOptions;
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
  options?: IJsonSchemasOptions;
};

export type RawSchemaType = 'model' | 'associationModel';

export type ParsedColumnInfo = JsonModelAttributeInOptionsForm & {
  columnNameInDb?: string;
  isForeignKey?: boolean;
};

export type ParsedTableInfo = {
  tableNameInDb?: string;
  isAssociationModel: boolean;
  primaryKey?: string;
  modelOptions: ModelOptions;
  columns: { [s: string]: ParsedColumnInfo };
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

export type NormalizeJsonFuncArgs = {
  table : RawSchema;
  tableType : RawSchemaType;
  tableName : string;
  column : any;
  columnName : string;
};

export type ParseJsonFuncArgs = NormalizeJsonFuncArgs & {
  schemasMetadata: SchemasMetadata;

  schemas : RawSchemas;
};

