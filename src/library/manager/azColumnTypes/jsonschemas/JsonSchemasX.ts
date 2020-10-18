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
  IJsonSchema,
  IJsonSchemas,
} from './IJsonSchemas';

import {
  typeConfigs,
} from './typeConfigs';

import {
  Schema,
  Schemas,
  Overwrite,
} from '../../../core';



// =======================

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

// =======================

export class JsonSchemasX {
  rawSchemas : RawSchemas;
  parsedInfo!: ParsedInfo;
  schema!: IJsonSchemas;

  constructor(rawSchemas : RawSchemas) {
    this.rawSchemas = rawSchemas;
    this.clear();
  }

  clear() {
    this.parsedInfo = { tables: {}, associationTables: {} };
    this.schema = {
      models: {},
      associationModels: {},
    };
  }

  normalize() : (Error | undefined) {
    this.clear();

    if (!this.rawSchemas.models) {
      return Error(`bad json data: no models provided`);
    }

    this.schema.models = {
      ...<any>this.rawSchemas.models,
    };

    if (this.rawSchemas.associationModels) {
      this.schema.associationModels = {
        ...<any>this.rawSchemas.associationModels,
      };
    }

    const err = JsonSchemasX.normalizeRawSchemas(this.parsedInfo.tables, this.schema.models);
    if (err) return err;
    return JsonSchemasX.normalizeRawSchemas(this.parsedInfo.associationTables, this.schema.associationModels);
  }

  static normalizeRawSchemas(
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    models : { [s: string]: IJsonSchema; },
  ) : Error | undefined {
    const modelKeys = Object.keys(models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = models[tableName];
      parsedTables[tableName] = {};
      const rawColumns = table.columns;
      const rawColumnKeys = Object.keys(rawColumns);
      for (let j = 0; j < rawColumnKeys.length; j++) {
        const columnName = rawColumnKeys[j];
        const column = rawColumns[columnName];
        if (!column.type) {
          return Error(`no type name: table(${tableName}), column(${columnName})`);
        }
        if (typeof column.type === 'string') {
          column.type = <any>[column.type];
        }
        if (column.primaryKey) {
          parsedTables[tableName].primaryKey = columnName;
        }
        if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
          return Error(`bad type name: table(${tableName}), column(${columnName})`);
        }
      }
    }
  }

  static parseModels(
    parsedInfo : ParsedInfo,
    rawSchemas : IJsonSchemas,
    result : Schemas,
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    models : { [s: string]: IJsonSchema; },
    resultModels: { [s: string]: Schema; },
  ) {
    const modelKeys = Object.keys(models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = models[tableName];
      resultModels[tableName] = {
        columns: {},
        options: table.options,
      };

      const rawColumns = table.columns;
      const rawColumnKeys = Object.keys(rawColumns);
      for (let j = 0; j < rawColumnKeys.length; j++) {
        const columnName = rawColumnKeys[j];
        const column = rawColumns[columnName];
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        if (!typeConfig) {
          return Error(`unknown type name: table(${tableName}), column(${columnName}), type(${typeName})`);
        }
        const parseResult = typeConfig.parseColumnSchema({
          parsedInfo,
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
      }
    }
  }

  parseSchema() : Schemas | Error {
    const result : Schemas = {
      models: {},
      associationModels: {},
    };
    let err = this.normalize();
    if (err) { return err; }

    const { parsedInfo, schema } = this;

    err = JsonSchemasX.parseModels(
      parsedInfo,
      schema,
      result,
      parsedInfo.tables, schema.models,
      result.models,
    )
    if (err) { return err; }

    err = JsonSchemasX.parseModels(
      parsedInfo,
      schema,
      result,
      parsedInfo.associationTables, schema.associationModels || {},
      result.associationModels!,
    )
    if (err) { return err; }
    return result;
  }
}
