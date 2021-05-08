import path from 'path';
import fs from 'fs';
import sequelize, {
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

import {
  RawModelAttributeColumnOptions,
  RawModelAttributes,
  RawSchema,
  RawSchemas,
  RawSchemaType,
  ParsedColumnInfo,
  ParsedTableInfo,
  SchemasMetadata,
  NormalizeJsonFuncArgs,
  ParseJsonFuncArgs,
} from './interfaces';

export const getRealColumnName = (columnName: string, column : JsonModelAttributeInOptionsForm) => {
  const {
    associationType,
  } = typeConfigs[column.type[0]];
  if (associationType) {
    return null;
  }
  return (<any>sequelize.Utils).underscore(columnName);
};

export const getForeignKey = (column : JsonModelAttributeInOptionsForm) => {
  const {
    associationType,
  } = typeConfigs[column.type[0]];
  if (!associationType) {
    return null;
  }
  if (associationType === 'belongsTo') {
    // console.log('column.type[1] :', column.type[1]);
    const option = column.type[2] as BelongsToOptions;
    // console.log('option :', option);
    if (option.foreignKey) {
      if (typeof option.foreignKey === 'string') {
        return option.foreignKey;
      }
      return option.foreignKey.name!;
    }
  }
  return null;
};
export const getTargetKey = (column : JsonModelAttributeInOptionsForm) => {
  const {
    associationType,
  } = typeConfigs[column.type[0]];
  if (!associationType) {
    return null;
  }
  if (associationType === 'belongsTo') {
    // console.log('column.type[1] :', column.type[1]);
    const option = column.type[2] as BelongsToOptions;
    // console.log('option :', option);
    if (option.targetKey) {
      return option.targetKey;
    }
  }
  return null;
};


// ==============================



export function forEachSchema<ColumnType = JsonModelAllAttributeType>(
  tableType : RawSchemaType,
  models : { [s: string]: IJsonSchema; },
  modelCb : ((tableName : string, tableType : RawSchemaType, jsonSchema : IJsonSchema) => Error | void) | null,
  columnCb : ((
    tableName : string, tableType : RawSchemaType, jsonSchema : IJsonSchema,
    columnName : string, column : ColumnType,
  ) => Error | void) | null,
) {
  const modelKeys = Object.keys(models);
  for (let i = 0; i < modelKeys.length; i++) {
    const tableName = modelKeys[i];
    const table = models[tableName];
    let err : void | Error;
    if (modelCb) {
      modelCb(tableName, tableType, table);
    }
    if (err) return err;
    if (!columnCb) {
      continue;
    }
    const rawColumns = table.columns;
    const rawColumnKeys = Object.keys(rawColumns);
    for (let j = 0; j < rawColumnKeys.length; j++) {
      const columnName = rawColumnKeys[j];
      const column = rawColumns[columnName];
      err = columnCb(tableName, tableType, table, columnName, <any>column)
      if (err) return err;
    }
  }
}

export function beforeNormalizeRawSchemas(
  metadata: SchemasMetadata,
  schemas: IJsonSchemas,
  rawSchemas: RawSchemas,
) : Error | void {
  if (!rawSchemas.options) {
    rawSchemas.options = {};
  }
  if (!rawSchemas.options.model) {
    rawSchemas.options.model = {};
  }
  if (!rawSchemas.options.model.tablePrefix) {
    rawSchemas.options.model.tablePrefix = 'tbl_';
  }

  if (!rawSchemas.options.associationModel) {
    rawSchemas.options.associationModel = {};
  }
  if (!rawSchemas.options.associationModel.tablePrefix) {
    rawSchemas.options.associationModel.tablePrefix = 'mn_';
  }

  schemas.options = rawSchemas.options;
}

export function normalizeRawSchemas(
  parsedTables : {
    [s : string]: ParsedTableInfo;
  },
  tableType : RawSchemaType,
  models : { [s: string]: IJsonSchema; },
  schemas: IJsonSchemas,
  rawSchemas: RawSchemas,
) : Error | void {
  forEachSchema(
    tableType,
    models,
    (tableName, tableType, table) => {
      table.options = getNormalizedModelOptions(tableName, tableType === 'associationModel' ? (schemas.options?.associationModel?.tablePrefix!) : (schemas.options?.model?.tablePrefix!), table.options || {});
      parsedTables[tableName] = {
        isAssociationModel: tableType === 'associationModel',
        modelOptions: table.options!,
        columns: {},
      };
    },
    (tableName, tableType, table, columnName, column) => {
      if (typeof column === 'string' || Array.isArray(column)) {
        column = {
          type: <any>column,
        };
      }
      table.columns[columnName] = column;
      if (!column.type) {
        return Error(`no type name: table(${tableName}), column(${columnName})`);
      }
      if (typeof column.type === 'string') {
        column.type = <any>[column.type];
      }
      column.extraOptions = column.extraOptions || {};
      if (column.primaryKey) {
        parsedTables[tableName].primaryKey = columnName;
      }
      if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
        return Error(`bad type name: table(${tableName}), column(${columnName})`);
      }
      const typeName = column.type[0];
      const typeConfig = typeConfigs[typeName];
      if (!typeConfig) {
        return Error(`unknown type name: table(${tableName}), column(${columnName}), type(${typeName})`);
      }
      parsedTables[tableName].columns[columnName] = column;
    },
  );

  forEachSchema<JsonModelAttributeInOptionsForm>(
    tableType,
    models,
    null,
    (tableName, tableType, table, columnName, column) => {
      const typeName = column.type[0];
      const typeConfig = typeConfigs[typeName];
      const err = typeConfig.normalize({
        table: <any>table,
        tableType,
        tableName,
        column,
        columnName,
      });
      if (err) {
        return err;
      }
    },
  );
}

export function afterNormalizeRawSchemas(
  parsedTables : {
    [s : string]: ParsedTableInfo;
  },
  tableType : RawSchemaType,
  models : { [s: string]: IJsonSchema; },
  metadata: SchemasMetadata,
  schemas: IJsonSchemas,
) : Error | void {
  forEachSchema(
    tableType,
    models,
    (tableName, tableType, table) => {
      const columns = parsedTables[tableName].columns!;
      Object.keys(columns).forEach((k) => {
        const c = columns[k];
        const columnNameInDb = getRealColumnName(k, c);
        if (columnNameInDb) {
          c.columnNameInDb = columnNameInDb;
          c.isForeignKey = false;
        } else {
          const fk = getForeignKey(c);
          if (fk) {
            c.columnNameInDb = fk;
            c.isForeignKey = true;
          }
        }
      })
    },
    (tableName, tableType, table, columnName, column) => {
      
    },
  );
}

export function parseRawSchemas(
  schemasMetadata : SchemasMetadata,
  rawSchemas : IJsonSchemas,
  tableType : RawSchemaType,
  models : { [s: string]: IJsonSchema; },
) : Error | void {
  forEachSchema<JsonModelAttributeInOptionsForm>(
    tableType,
    models,
    null,
    (tableName, tableType, table, columnName, column) => {
      const typeName = column.type[0];
      const typeConfig = typeConfigs[typeName];
      const result = typeConfig.parse({
        schemasMetadata,
        schemas: <any>rawSchemas,
        table: <any>table,
        tableType,
        tableName,
        column,
        columnName,
      });
      if (result instanceof Error) {
        return result;
      }
      table.columns[columnName] = result;
    },
  );
}

export function toCoreModels(
  schemasMetadata : SchemasMetadata,
  rawSchemas : IJsonSchemas,
  tableType : RawSchemaType,
  models : { [s: string]: IJsonSchema; },
  resultModels: { [s: string]: AmmSchema; },
) : (Error | void) {
  forEachSchema<JsonModelAttributeInOptionsForm>(
    tableType,
    models,
    (tableName, tableType, table) => {
      resultModels[tableName] = {
        columns: {},
        options: table.options,
      };
    },
    (tableName, tableType, table, columnName, column) => {
      const typeName = column.type[0];
      const typeConfig = typeConfigs[typeName];
      const parseResult = typeConfig.toCoreColumn({
        schemasMetadata,
        schemas: <any>rawSchemas,
        table: <any>table,
        tableType: 'associationModel',
        tableName,
        column,
        columnName,
      });
      if (parseResult instanceof Error) {
        return Error(`parse type error: table(${tableName}), column(${columnName}), type(${typeName}), error: ${parseResult.message}`);
      }
      resultModels[tableName].columns[columnName] = parseResult;
    },
  );
}