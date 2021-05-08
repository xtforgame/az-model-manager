import { Table, Column, Index, Db } from 'pg-structure';
import { IJsonSchemas } from './IJsonSchemas';
import { RawSchemas, SchemasMetadata } from './interfaces';
import { AmmSchemas } from '../../../core';
export declare class JsonSchemasX {
    rawSchemas: RawSchemas;
    dbSchemaName: string;
    parsed: boolean;
    schemasMetadata: SchemasMetadata;
    schemas: IJsonSchemas;
    constructor(dbSchemaName: string, rawSchemas: RawSchemas);
    clear(): void;
    normalizeRawSchemas(): Error | void;
    afterNormalizeRawSchemas(): Error | void;
    parseRawSchemas(): Error | void;
    toCoreSchemas(): AmmSchemas | Error;
    buildModelTsFile(args?: {
        orders?: string[];
        liquidRoot?: string;
    }): Promise<string>;
    compareDb(db: Db): {
        missedTables: string[];
        missedColumn: string[];
    };
    parseSchemaFromDb(db: Db): {
        dbSchema: import("pg-structure").Schema;
        tables: {
            [s: string]: {
                table: Table;
                columns: {
                    [s: string]: Column;
                };
                indexes: {
                    [s: string]: Index;
                };
            };
        };
    };
    parseTableFromDb(table: Table): {
        table: Table;
        columns: {
            [s: string]: Column;
        };
        indexes: {
            [s: string]: Index;
        };
    };
    reportColumn(column: Column): void;
    reportIndex(index: Index): void;
}
