import pgStructure, {
  Table,
  Column,
  Index,
} from 'pg-structure';
import az_pglib from './azpg/az_pglib';
import { Schemas } from '../core/interfaces';
import { AzSchemas, typeConfigs } from './azColumnTypes';

export default class AmmModelManager {
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

  testParseSchema() : Schemas | Error {
    // const rawSchemas : AzSchemas = {
    const rawSchemas : AzSchemas = {
      models: {
        table1: {
          columns: {
            hasOne: {
              type: ['hasOne', 'x', {}],
            },
            hasMany: {
              type: ['hasMany', 'x', {}],
            },
            belongsTo: {
              type: ['belongsTo', 'x', {}],
            },
            belongsToMany: {
              type: ['belongsToMany', 'x', { through: '' }],
            },
            ccc: {
              type: 'decimal',
            },
          },
          options: {},
        },
      },
      associationModels: {
        aTable1: {
          columns: {
            hasOne: {
              type: ['hasOne', 'x', {}],
            },
            hasMany: {
              type: ['hasMany', 'x', {}],
            },
            belongsTo: {
              type: ['belongsTo', 'x', {}],
            },
            belongsToMany: {
              type: ['belongsToMany', 'x', { through: '' }],
            },
            ccc: {
              type: 'decimal',
            },
          },
          options: {},
        },
      },
    };
    const result : Schemas = {
      models: {},
      associationModels: {},
    };
    const modelKeys = Object.keys(rawSchemas.models);
    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = rawSchemas.models[tableName];
      result.models[tableName] = {
        columns: {},
        options: table.options,
      };
      const rawColumns = table.columns;
      const rawColumnKeys = Object.keys(rawColumns);
      for (let j = 0; j < rawColumnKeys.length; j++) {
        const columnName = rawColumnKeys[j];
        const column = rawColumns[columnName];
        if (!column.type) {
          return Error(`no type name: table(${table}), column(${columnName})`);
        }
        if (typeof column.type === 'string') {
          column.type = <any>[column.type];
        }
        if (!Array.isArray(column.type) || !column.type.length || typeof column.type[0] !== 'string') {
          return Error(`bad type name: table(${table}), column(${columnName})`);
        }
      }
    }

    for (let i = 0; i < modelKeys.length; i++) {
      const tableName = modelKeys[i];
      const table = rawSchemas.models[tableName];
      const rawColumns = table.columns;
      const rawColumnKeys = Object.keys(rawColumns);
      for (let j = 0; j < rawColumnKeys.length; j++) {
        const columnName = rawColumnKeys[j];
        const column = rawColumns[columnName];
        const typeName = column.type[0];
        const typeConfig = typeConfigs[typeName];
        if (!typeConfig) {
          return Error(`unknown type name: table(${table}), column(${columnName}), type(${typeName})`);
        }
        const parseResult = typeConfig.parseColumnSchema({
          schemas: <any>rawSchemas,
          table: <any>table,
          tableType: 'model',
          tableName,
          column,
          columnName,
        });
        if (parseResult instanceof Error) {
          return Error(`parse type error: table(${table}), column(${columnName}), type(${typeName}), error: ${parseResult.message}`);
        }
        result.models[tableName].columns[columnName] = parseResult;
      }
    }
    return result;
  }
}
