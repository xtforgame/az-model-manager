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
} from './IJsonSchemas';

import {
  Overwrite,
} from '../../../core/utils';

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

export class JsonSchema {
  rawJson : RawSchemas;

  constructor(rawJson : RawSchemas) {
    this.rawJson = rawJson;
  }

  static normalizeRawSchemas(
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    models : { [s: string]: IJsonSchema; },
  ) {
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
}
