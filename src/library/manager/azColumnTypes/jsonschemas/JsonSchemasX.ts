import sequelize, {
  AbstractDataTypeConstructor,

  DataType,
  Model,
  ModelDefined,
  ModelAttributes,
  ModelOptions,
  ModelAttributeColumnOptions,
} from 'sequelize';
import pgStructure, {
  Table,
  Column,
  Index,
  Db,
} from 'pg-structure';

import {
  IJsonSchema,
  IJsonSchemas,
  JsonModelAllAttributeType,
  JsonModelAttributeInOptionsForm,
} from './IJsonSchemas';

import {
  typeConfigs,
} from './typeConfigs';

import {
  AmmSchema,
  AmmSchemas,
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

export type SchemasMetadata = {
  models: {
    [s : string]: ParsedTableInfo;
  };
  associationModels: {
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

// =======================

export class JsonSchemasX {
  rawSchemas : RawSchemas; // from input
  dbSchemaName : string; // from db

  parsed!: boolean;

  schemasMetadata!: SchemasMetadata;
  schema!: IJsonSchemas;

  constructor(dbSchemaName : string, rawSchemas : RawSchemas) {
    this.dbSchemaName = dbSchemaName;
    this.rawSchemas = rawSchemas;
    this.clear();
  }

  clear() {
    this.parsed = false;
    this.schemasMetadata = { models: {}, associationModels: {} };
    this.schema = {
      models: {},
      associationModels: {},
    };
  }

  static forEachSchema<ColumnType = JsonModelAllAttributeType>(
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

  static normalizeRawSchemas(
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
  ) : Error | void {
    JsonSchemasX.forEachSchema(
      tableType,
      models,
      (tableName) => { parsedTables[tableName] = {}; },
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
      },
    );

    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
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

  static parseRawSchemas(
    schemasMetadata : SchemasMetadata,
    rawSchemas : IJsonSchemas,
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
  ) : Error | void {
    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
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

  static toCoreModels(
    schemasMetadata : SchemasMetadata,
    rawSchemas : IJsonSchemas,
    tableType : RawSchemaType,
    models : { [s: string]: IJsonSchema; },
    resultModels: { [s: string]: AmmSchema; },
  ) : (Error | void) {

    JsonSchemasX.forEachSchema<JsonModelAttributeInOptionsForm>(
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

  normalizeRawSchemas() : Error | void {
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

    const err = JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.models, 'model', this.schema.models);
    if (err) return err;
    return JsonSchemasX.normalizeRawSchemas(this.schemasMetadata.associationModels, 'associationModel', this.schema.associationModels);
  }

  parseRawSchemas() : Error | void {
    this.parsed = false;
    let err = this.normalizeRawSchemas();
    if (err) { return err; }
    const { schemasMetadata, schema } = this;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schema, 'model', this.schema.models);
    if (err) return err;
    err = JsonSchemasX.parseRawSchemas(schemasMetadata, schema, 'associationModel', this.schema.associationModels);
    this.parsed = false;
    return err;
  }

  toCoreSchemas() : AmmSchemas | Error {
    const result : AmmSchemas = {
      models: {},
      associationModels: {},
    };

    if (!this.parsed) {
      const err = this.parseRawSchemas();
      if (err) return err;
    }

    const { schemasMetadata, schema } = this;

    let err = JsonSchemasX.toCoreModels(
      schemasMetadata,
      schema,
      'model',
      schema.models,
      result.models,
    );
    if (err) { return err; }

    err = JsonSchemasX.toCoreModels(
      schemasMetadata,
      schema,
      'associationModel',
      schema.associationModels,
      result.associationModels!,
    );
    if (err) { return err; }
    return result;
  }

  // ========================

  parseSchemaFromDb(db : Db) {
    const dbSchema = db.schemas.get(this.dbSchemaName);
    const table = db.get('tbl_account_link') as Table;
    return this.parseTableFromDb(table);
    // console.log('db.schemas.get("public") :', db.schemas.get('public').sequences);
    // const table = db.get('tbl_account_link') as Table;
    // return this.reportTable(table);
  }

  parseTableFromDb(table : Table) {
    // console.log('table :', table);
    const columnNames = table.columns.map((c) => {
      this.reportColumn(c);
      return c.name;
    });
    console.log('columnNames :', columnNames);
    // const constraintNames = table.constraints.map((c) => {
    //   console.log('c :', c);
    //   return c.name;
    // });
    // console.log('constraintNames :', constraintNames);
    const indexNames = table.indexes.map((i) => {
      this.reportIndex(i);
      return i.name;
    });
    console.log('indexNames :', indexNames);
    // const columnTypeName = table.columns.get('owner_id').type.name;
    // const indexColumnNames = table.indexes.get('ix_mail').columns;
    const relatedTables = table.hasManyTables;
    console.log('relatedTables :', relatedTables);
  }

  reportColumn(column : Column) {
    // console.log('column.name :', column.name);
    // console.log('column.type.name :', column.type.name);
    // // // console.log('column.comment :', column.comment);
    // // console.log('column.notNull :', column.notNull);
    // console.log('column.length :', column.length);
    // console.log('column.precision :', column.precision);
    // // console.log('column.scale :', column.scale);
    // // console.log('column.arrayDimension :', column.arrayDimension);
    // // console.log('column.defaultWithTypeCast :', column.defaultWithTypeCast);
    // // console.log('column.attributeNumber :', column.attributeNumber);
  }

  reportIndex(index : Index) {
    // console.log('index.isPrimaryKey :', index.isPrimaryKey);
    if (index.isPrimaryKey) {
      console.log('index.columnsAndExpressions :', index.columnsAndExpressions.map(col => typeof col === 'string' ? col : col.name).join(', '));
    } else if (index.isUnique) {
      console.log('index.partialIndexExpression :', index.partialIndexExpression);
    }
  }
}
