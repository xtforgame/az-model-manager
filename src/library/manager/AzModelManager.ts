import pgStructure, {
  Table,
  Column,
  Index,
} from 'pg-structure';
import az_pglib from './azpg/az_pglib';
import { AmmSchemas, AmmSchema } from '../core/interfaces';
import { IJsonSchema, IJsonSchemas, RawSchemas, JsonSchemasX, typeConfigs, ParsedTableInfo } from './azColumnTypes';
import getTestSchema from './getTestSchema';

export default class AzModelManager {
  connectString : string;

  constructor(connectString : string) {
    this.connectString = connectString;
  }

  async getPgStructureDb() {
    const r = await az_pglib.create_connection(this.connectString);
    const db = await pgStructure(r.client, { includeSchemas: ['public'], keepConnection: true });
    await r.client.end();
    return db;
  }

  async reportDb() {
    const r = await az_pglib.create_connection(this.connectString);
    const db = await pgStructure(r.client, { includeSchemas: ['public'], keepConnection: true });
    await r.client.end();
    const jsonSchemasX = new JsonSchemasX('public', <any>{});
    return jsonSchemasX.parseSchemaFromDb(db);
  }

  // =============

  testParseSchema() : AmmSchemas | Error {
    const rawSchemas = getTestSchema();
    const jsonSchemasX = new JsonSchemasX('public', <any>rawSchemas);
    return jsonSchemasX.toCoreSchemas();
  }
}
