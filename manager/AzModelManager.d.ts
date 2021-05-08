import { Table, Column, Index } from 'pg-structure';
import { AmmSchemas } from '../core/interfaces';
export default class AzModelManager {
    connectString: string;
    constructor(connectString: string);
    getPgStructureDb(): Promise<import("pg-structure").Db>;
    reportDb(): Promise<{
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
    }>;
    testParseSchema(): AmmSchemas | Error;
}
