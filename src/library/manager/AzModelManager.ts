import pgStructure, {
  Table,
  Column,
  Index,
} from 'pg-structure';
import az_pglib from './azpg/az_pglib';
import { Schemas, Schema } from '../core/interfaces';
import { IJsonSchema, IJsonSchemas, RawSchemas, JsonSchemasX, typeConfigs, ParsedInfo, ParsedTableInfo } from './azColumnTypes';
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

  testParseSchema() : Schemas | Error {
    const rawSchemas = getTestSchema();
    const jsonSchemasX = new JsonSchemasX(<any>rawSchemas);
    return jsonSchemasX.parseSchema();
  }
}
