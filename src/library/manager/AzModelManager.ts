import pgStructure, {
  Table,
  Column,
  Index,
} from 'pg-structure';
import az_pglib from './azpg/az_pglib';
import { Schemas, Schema } from '../core/interfaces';
import { AzSchema, JsonSchemas, typeConfigs, ParsedInfo, ParsedTableInfo } from './azColumnTypes';
import getTestSchema from './getTestSchema';

export default class AzModelManager {
  connectString : string;

  constructor(connectString : string) {
    this.connectString = connectString;
  }

  reportColumn(column : Column) {
    console.log('column.name :', column.name);
    console.log('column.type.name :', column.type.name);
    // // console.log('column.comment :', column.comment);
    // console.log('column.notNull :', column.notNull);
    console.log('column.length :', column.length);
    console.log('column.precision :', column.precision);
    // console.log('column.scale :', column.scale);
    // console.log('column.arrayDimension :', column.arrayDimension);
    // console.log('column.defaultWithTypeCast :', column.defaultWithTypeCast);
    // console.log('column.attributeNumber :', column.attributeNumber);
  }

  reportIndex(index : Index) {
    console.log('index.isPrimaryKey :', index.isPrimaryKey);
    console.log('index.columnsAndExpressions :', index.columnsAndExpressions.map(col => typeof col === 'string' ? col : col.name).join(', '));
  }

  reportTable(table : Table) {
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

  async reportDb() {
    // const r = await az_pglib.create_connection(this.connectString);
    // const db = await pgStructure(r.client, { includeSchemas: ['public'], keepConnection: true });
    // await r.client.end();
    // // console.log('db.schemas.get("public") :', db.schemas.get('public').sequences);
    // const table = db.get('tbl_account_link') as Table;
    // return this.reportTable(table);
  }

  // =============

  static normalizeRawSchemas(
    result : Schemas,
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    models : { [s: string]: AzSchema; },
    resultModels: { [s: string]: Schema; },
  ) {
    const modelKeys = Object.keys(models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = models[tableName];
      parsedTables[tableName] = {};
      resultModels[tableName] = {
        columns: {},
        options: table.options,
      };
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

  static initModels(
    parsedInfo : ParsedInfo,
    rawSchemas : JsonSchemas,
    result : Schemas,
    parsedTables : {
      [s : string]: ParsedTableInfo;
    },
    models : { [s: string]: AzSchema; },
    resultModels: { [s: string]: Schema; },
  ) {
    const modelKeys = Object.keys(models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = models[tableName];
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

  static parseSchema(rawSchemas : JsonSchemas) : Schemas | Error {
    const result : Schemas = {
      models: {},
      associationModels: {},
    };
    const parsedInfo : ParsedInfo = { tables: {}, associationTables: {} };
    const modelKeys = Object.keys(rawSchemas.models);
    let err : Error | undefined;
    err = AzModelManager.normalizeRawSchemas(result, parsedInfo.tables, rawSchemas.models, result.models);
    if (err) { return err; }
    err = AzModelManager.normalizeRawSchemas(result, parsedInfo.associationTables, rawSchemas.associationModels || {}, result.associationModels!);
    if (err) { return err; }

    err = AzModelManager.initModels(
      parsedInfo,
      rawSchemas,
      result,
      parsedInfo.tables, rawSchemas.models,
      result.models,
    )
    if (err) { return err; }

    err = AzModelManager.initModels(
      parsedInfo,
      rawSchemas,
      result,
      parsedInfo.associationTables, rawSchemas.associationModels || {},
      result.associationModels!,
    )
    if (err) { return err; }
    return result;
  }

  testParseSchema() : Schemas | Error {
    const rawSchemas = getTestSchema();
    return AzModelManager.parseSchema(rawSchemas);
  }
}
